const ridesure = "/ridesure.png";
const Move9ja = "/image.png";
import Kilobyte from "../public/kilobyted.png"
import ssh from "../public/ssh.png"
import unikratives from "../public/unikratives.webp"
import makeScholarship from "../public/make-scholarship.png"
import brilliance from "../public/brilliance-integrated.png"
import n8n from "../public/n8n-servicesignal.png"

interface DataProps {
  id: number,
  title: string,
  desc: string,
  link: string,
  image: any,
  tools: string[],
  role: string,
  type: string
}

export const data: DataProps[] = [
  {
    id: 10,
    title: "Brilliance Integrated",
    desc: "A professional business website for Brilliance Integrated, built to establish their online presence and showcase their services to clients.",
    link: "https://www.brillianceintegrated.com",
    image: brilliance,
    tools: ["Next.js", "Tailwind CSS", "TypeScript"],
    role: "Solo Project (09/2026)",
    type: "Business"
  },
  {
    id: 9,
    title: "Scholarship Alert Bot",
    desc: "An automated Make.com workflow that scrapes scholarship RSS feeds daily at 7AM, filters relevant opportunities via AI, and delivers a formatted digest to a Telegram channel — zero manual effort.",
    link: "",
    image: makeScholarship,
    tools: ["Make.com", "Telegram Bot API", "RSS", "OpenAI"],
    role: "Solo Project (09/2026)",
    type: "AI Automation"
  },
  {
    id: 8,
    title: "ServiceSignal — Workshop Feedback AI",
    desc: "An n8n workflow that receives customer feedback via webhook, uses OpenAI to classify sentiment and urgency, routes complaints to a manager, sends professional email replies, and syncs everything to Google Sheets.",
    link: "",
    image: n8n,
    tools: ["n8n", "OpenAI", "Google Sheets", "Webhooks", "Email"],
    role: "Solo Project (09/2026)",
    type: "AI Automation"
  },
  {
    id: 7,
    title: "Recall",
    desc: "A mobile app that helps users find and book rides easily, with real-time tracking and secure payments.",
    link: "",
    image: Move9ja,
    tools: ["Nextjs", "PWA"],
    role: "Solo Project (06/2026)",
    type: "Customer Reminder"
  },
  {
    id: 6,
    title: "SoundSkill Hub",
    desc: "An education and learning platform for music and sound skills, helping creatives grow their craft online.",
    link: "https://soundskillhub.com",
    image: ssh,
    tools: ["Next.js", "SEO Optimization", "TypeScript"],
    role: "Solo Project (06/2026)",
    type: "Education & Learning"
  },
  {
    id: 4,
    title: "Unikratives",
    desc: "A business platform for creative entrepreneurs, showcasing services and digital products to grow their brand.",
    link: "https://www.unikratives.com",
    image: unikratives,
    tools: ["Next.js", "SEO Optimization", "TypeScript"],
    role: "Team Project @ 4onStudiosLTD (05/2026)",
    type: "Business"
  },
  {
    id: 0,
    title: "Resume & CV Builder",
    desc: "A mobile app that helps users create professional resumes quickly and stand out when applying for jobs.",
    link: "https://play.google.com/store/apps/details?id=com.fonstudios.cvbuilder",
    image: "https://play-lh.googleusercontent.com/vbPCVr3TotkXNNU8L361rWp2BlZl4Zvm6ZaHa9arv6Xbuoll7x-nSKimvzp3K0THiW56=w480-h960-rw",
    tools: ["React Native", "Mobile Development"],
    role: "Team Project @ 4onStudiosLTD (04/2025)",
    type: "Productivity"
  },
  {
    id: 1,
    title: "CustomerApp & ParkManagerApp",
    desc: "A booking platform that allows users to compare transport options and book tickets easily.",
    link: "https://move9ja.com/",
    image: Move9ja,
    tools: ["React", "Product Development", "UI/UX"],
    role: "Team Project @ SmartWorks (09/2024)",
    type: "Logistics"
  },
  {
    id: 2,
    title: "Kilobyte Studios",
    desc: "A portfolio website of a professional graphics designer based in Africa.",
    link: "https://kilobyte-five.vercel.app/",
    image: Kilobyte,
    tools: ["Nextjs", "Tailwind CSS", "TypeScript"],
    role: "Solo Project (04/2026)",
    type: "Personal Brand"
  },
  {
    id: 3,
    title: "Gimo Interiors",
    desc: "Quality bedding, elegant curtains, and professional interior decoration services for your dream home.",
    link: "https://gimo-three.vercel.app/",
    image: "https://plus.unsplash.com/premium_photo-1670869816731-97a307d1c7ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVkZGluZ3N8ZW58MHx8MHx8fDA%3D",
    tools: ["Nextjs", "Tailwind CSS", "TypeScript"],
    role: "Solo Project (12/2025)",
    type: "Business"
  },
  {
    id: 5,
    title: "RideSure Admin Panel",
    desc: "An admin panel for RideSure, a ride-hailing service, built to manage drivers, rides, and users efficiently.",
    link: "https://www.adminridesure.com/login",
    image: ridesure,
    tools: ["Full Stack Tools"],
    role: "Team Project @ SmartWorks (04/2025)",
    type: "Management"
  },
]
