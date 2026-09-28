'use client';

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import * as yup from "yup";
import Side from "@/components/Side";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Facebook, Github, Instagram, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Email is not well written")
      .required("Email is required"),
    message: yup.string().required("Message is required"),
  })
  .required();

export default function Contact() {

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter()

  const handleClick = () => {
    const message = "Hello, Osim Uka!"
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+2347066530998?text=${encodedMessage}`;
    window.location.href = whatsappUrl;
  };

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to send email");
      }

      return payload;
    },
    onSuccess: () => {
      toast.success("Sent email successfully");
      reset();
      router.push("/");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    },
  });
  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };
  return (
    <div className="bg-bg min-h-screen text-fg">
      <div className="mt-24 mb-20 grid grid-cols-1 md:grid-cols-[30%_65%] gap-12 max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full"></div>
          <Side />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-4xl md:text-7xl text-left mb-8 text-fg font-instrument">
            Follow Me
          </h1>
          <div className="flex items-center gap-3 justify-start my-8 flex-wrap">
            {[
              { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/uka.osim.56" },
              { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/in/uka-osim-9761601a0/" },
              { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/ukaosim/" },
              { icon: Twitter, label: "X (Twitter)", url: "https://x.com/teamjojo_code" },
              { icon: Github, label: "Github", url: "https://github.com/joshosim" },
              { icon: MessageCircle, label: "Whatsapp", url: null, onClick: handleClick },
            ].map((social, idx) => (
              <button
                key={idx}
                className="text-xs uppercase tracking-widest rounded-full border border-subtle text-muted font-medium px-4 py-2 flex items-center gap-2 hover:text-fg hover:border-accent transition-all duration-300"
                onClick={social.onClick || (() => window.open(social.url, "_blank"))}
              >
                <social.icon size={16} className="text-muted group-hover:text-accent" />
                {social.label}
              </button>
            ))}
          </div>
          <h2 className="font-bold text-3xl md:text-4xl text-left mb-8 text-fg font-instrument">
            Reach out to me.
          </h2>
          <form
            className="surface-subtle rounded-2xl p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <input
                      {...field}
                      placeholder="Name"
                      className="w-full bg-surface border border-subtle text-fg rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs">{errors.name.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <input
                      {...field}
                      placeholder="Email"
                      className="w-full bg-surface border border-subtle text-fg rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <Controller
              name="message"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div className="mb-6 flex flex-col gap-2">
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Message"
                    className="w-full bg-surface border border-subtle text-fg rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs">{errors.message.message}</p>
                  )}
                </div>
              )}
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full btn-primary rounded-lg py-4 text-xs uppercase tracking-widest font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Sending…" : "Send a Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
