"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_READER_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
const SEGMENT_SIZE = 3500;
type Clip = { url: string; name: string };

function splitText(source: string): string[] {
  const paragraphs = source.trim().split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    let remaining = paragraph.trim();
    while (remaining.length > SEGMENT_SIZE) {
      const cut = Math.max(remaining.lastIndexOf(". ", SEGMENT_SIZE), remaining.lastIndexOf(" ", SEGMENT_SIZE));
      const boundary = cut > 0 ? cut + 1 : SEGMENT_SIZE;
      const piece = remaining.slice(0, boundary).trim();
      if (current) chunks.push(`${current}\n\n${piece}`);
      else chunks.push(piece);
      current = "";
      remaining = remaining.slice(boundary).trim();
    }
    if ((current.length + remaining.length + 2) > SEGMENT_SIZE && current) {
      chunks.push(current);
      current = remaining;
    } else current = current ? `${current}\n\n${remaining}` : remaining;
  }
  if (current) chunks.push(current);
  return chunks;
}

export default function ReaderPage() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [voice, setVoice] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [pages, setPages] = useState<number | null>(null);
  const [busy, setBusy] = useState<"extract" | "voice" | "speech" | null>(null);
  const [message, setMessage] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [current, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clipsRef = useRef<Clip[]>([]);

  useEffect(() => { clipsRef.current = clips; }, [clips]);
  useEffect(() => () => clipsRef.current.forEach((clip) => URL.revokeObjectURL(clip.url)), []);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed, current, clips]);

  const clearClips = () => { clips.forEach((clip) => URL.revokeObjectURL(clip.url)); setClips([]); setCurrent(0); };

  async function extractPdf() {
    if (!pdf) return;
    setBusy("extract"); setMessage("");
    try {
      const body = new FormData(); body.append("file", pdf);
      const response = await fetch(`${API_URL}/api/documents/extract`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error?.message || "Could not read this PDF.");
      setText(data.text); setFilename(data.filename); setPages(data.pages); clearClips();
      setMessage(`Extracted text from ${data.pages} page(s).`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF extraction failed."); }
    finally { setBusy(null); }
  }

  async function saveVoice() {
    if (!voice) return;
    setBusy("voice"); setMessage("");
    try {
      const body = new FormData(); body.append("file", voice);
      const response = await fetch(`${API_URL}/api/voice/reference`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error?.message || "Could not save voice sample.");
      setMessage(data.message || "Voice reference saved privately on the Python engine.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Voice upload failed."); }
    finally { setBusy(null); }
  }

  async function generateSpeech() {
    if (!text.trim()) { setMessage("Add or extract some text first."); return; }
    clearClips(); setBusy("speech"); setMessage("");
    const pieces = splitText(text);
    const generated: Clip[] = [];
    try {
      for (let index = 0; index < pieces.length; index += 1) {
        setMessage(`Generating audio segment ${index + 1} of ${pieces.length}…`);
        const response = await fetch(`${API_URL}/api/speech/generate`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: pieces[index] }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || data.error?.message || `Speech generation failed at segment ${index + 1}.`);
        }
        generated.push({ url: URL.createObjectURL(await response.blob()), name: `buildwithosim-reader-${String(index + 1).padStart(3, "0")}.wav` });
        setClips([...generated]);
      }
      setMessage(`${generated.length} audio segment${generated.length === 1 ? "" : "s"} ready.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Speech generation failed.");
      if (!generated.length) clearClips();
    } finally { setBusy(null); }
  }

  const progress = clips.length ? Math.round(((current + 1) / clips.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-sm font-semibold tracking-[0.25em] text-[#1D6DFB]">BUILDWITHOSIM / LAB</p><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Reader</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Turn documents and written content into speech with a private voice reference.</p></div>
          <Link href="/" className="text-sm text-slate-400 transition hover:text-white">← Back to portfolio</Link>
        </header>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold">01. Add a PDF</h2><p className="mt-1 text-sm leading-6 text-slate-400">Text PDFs up to 25 MB. Scanned PDFs need OCR, which is not configured.</p>
              <input type="file" accept="application/pdf,.pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} className="mt-4 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white" />
              {pdf && <p className="mt-3 break-all text-xs text-slate-400">{pdf.name}</p>}
              <button onClick={extractPdf} disabled={!pdf || busy !== null} className="mt-4 w-full rounded-xl bg-[#1D6DFB] px-4 py-3 text-sm font-semibold disabled:opacity-40">{busy === "extract" ? "Extracting text…" : "Extract PDF text"}</button>
              {filename && <p className="mt-3 text-xs text-emerald-400">{filename}{pages !== null ? ` · ${pages} pages` : ""}</p>}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold">02. Your voice reference</h2><p className="mt-1 text-sm leading-6 text-slate-400">Upload a clean WAV recording of your own voice. This provides a reference for zero-shot cloning; it does not train a model.</p>
              <input type="file" accept=".wav,audio/wav" onChange={(e) => setVoice(e.target.files?.[0] || null)} className="mt-4 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-medium file:text-white" />
              {voice && <p className="mt-3 break-all text-xs text-slate-400">{voice.name}</p>}
              <button onClick={saveVoice} disabled={!voice || busy !== null} className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-40">{busy === "voice" ? "Uploading…" : "Save voice sample"}</button>
              <p className="mt-3 text-xs text-slate-500">Only your private backend can access this recording. Use a recording you own or have permission to use.</p>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">03. Reading workspace</h2><p className="mt-1 text-sm text-slate-400">Paste text or extract it from a PDF.</p></div><span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-300">Reader</span></div>
            <textarea value={text} onChange={(e) => { setText(e.target.value); clearClips(); }} placeholder="Your extracted or pasted text will appear here…" className="min-h-[390px] w-full resize-y rounded-xl border border-white/10 bg-[#05070c] p-4 text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span>{text.length.toLocaleString()} characters</span><button onClick={() => { setText(""); setFilename(""); setPages(null); clearClips(); }} className="hover:text-white">Clear workspace</button></div>
            <button onClick={generateSpeech} disabled={!text.trim() || busy !== null} className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 hover:bg-blue-100 disabled:opacity-40">{busy === "speech" ? "Generating audio…" : "Generate speech"}</button>
            {clips.length > 0 && <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{filename || "Generated reading"}</p><label className="text-xs text-slate-400">Speed <select aria-label="Playback speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="ml-2 rounded bg-white/10 px-2 py-1 text-white">{[0.75, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}×</option>)}</select></label></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded bg-white/10"><div className="h-full bg-[#1D6DFB] transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-xs text-slate-400">Segment {current + 1} of {clips.length}</p>
              <audio ref={audioRef} controls src={clips[current]?.url} onEnded={() => setCurrent((value) => Math.min(value + 1, clips.length - 1))} className="mt-3 w-full" />
              <div className="mt-3 flex items-center justify-between"><button onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} className="text-sm text-slate-300 hover:text-white disabled:opacity-40">← Previous</button><a href={clips[current]?.url} download={clips[current]?.name} className="text-sm text-blue-300 hover:text-blue-200">Download this segment</a><button onClick={() => setCurrent((value) => Math.min(clips.length - 1, value + 1))} disabled={current >= clips.length - 1} className="text-sm text-slate-300 hover:text-white disabled:opacity-40">Next →</button></div>
            </div>}
            {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-slate-300">{message}</p>}
          </section>
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">BUILDWITHOSIM Reader · PDF text extraction and reference voice synthesis</p>
      </div>
    </main>
  );
}
