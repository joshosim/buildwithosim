'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Avatar from '../public/avatar.png'
import { data } from '../utils/project-data'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const element = entry.target as HTMLElement
          element.classList.add('active')
          element.style.opacity = '1'
          element.style.transform = 'translateY(0)'
        }),
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach((element) => {
      const revealElement = element as HTMLElement
      revealElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(revealElement)
    })

    return () => observer.disconnect()
  }, [])

  const services = [
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "Web Development",
      desc: "I create modern websites that help businesses attract and convert customers.",
      ul: ["React & Next.js", "Node.js/Expressjs Backend", "E-commerce Solutions"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Mobile Apps",
      desc: "Native and cross-platform mobile applications that deliver exceptional user experiences.",
      ul: ["React Native", "Android Development", "IOS Development"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      title: "Landing Page for Creators",
      desc: "High-converting landing pages designed to turn visitors into customers.",
      ul: ["Conversion Optimized Design", "Creator Economy", "Analytics Integration"],
    },
    {
      icon: (
        <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: "Digital Tools",
      desc: "I create useful digital products that improve productivity and workflow.",
      ul: ["Internal Tools", "Productivity Apps", "Custom Software Solutions"],
    },
  ]

  const testimonials = [
    {
      quote: "Osim is a reliable Software Engineer who consistently delivers clean and responsive user interfaces. He works well with design teams and pays attention to detail, especially when building dashboards and user-focused features. He’s proactive, easy to work with, and always willing to improve!",
      name: "Engr Uka Osim (Snr)", role: "CEO, 4onstudiosLTD", initials: "UO", gradient: "from-indigo-400 to-purple-400",
    },
    {
      quote: "Working with Osim was a game-changer for our startup. He built our MVP in record time and the code quality was exceptional. Highly recommend!",
      name: "Michael Chen", role: "Founder, TechStart", initials: "MC", gradient: "from-pink-400 to-orange-400",
    },
    {
      quote: "Osim's landing page design increased our conversion rate by 60%. He understood our brand perfectly and delivered beyond what we imagined.",
      name: "Emily Rodriguez", role: "Marketing Director, GrowthCo", initials: "ER", gradient: "from-cyan-400 to-blue-400",
    },
  ]

  const techStack = [
    {
      name: "React",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#61DAFB"><circle cx="64" cy="64" r="11.4" /><path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z" /></g></svg>
      ),
    },
    {
      name: "Next.js",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6h-6.8V41.8h6.8l50.5 75.8C116.4 106.2 128 86.5 128 64c0-35.3-28.7-64-64-64zm22.1 84.6l-7.5-11.3V41.8h7.5v42.8z" /></svg>
      ),
    },
    {
      name: "Node.js",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#83CD29" d="M112.771 30.334L68.674 4.729c-2.781-1.584-6.402-1.584-9.205 0L14.901 30.334C12.031 31.985 10 35.088 10 38.407v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623C42.594 41 41 42.061 41 42.773v50.49c0 3.896-3.524 7.773-10.11 4.48L18.723 90.73c-.424-.23-.723-.693-.723-1.181V38.407c0-.482.555-.966.982-1.213l44.424-25.561c.415-.235 1.025-.235 1.439 0l43.882 25.555c.42.253.272.722.272 1.219v51.142c0 .488.183.963-.232 1.198l-44.086 25.576c-.378.227-.847.227-1.261 0l-11.307-6.749c-.341-.198-.746-.269-1.073-.086-3.146 1.783-3.726 2.02-6.677 3.043-.726.253-1.797.692.41 1.929l14.798 8.754a9.294 9.294 0 004.647 1.246c1.642 0 3.25-.426 4.667-1.246l43.885-25.582c2.87-1.672 4.23-4.764 4.23-8.083V38.407c0-3.319-1.36-6.414-4.229-8.073zM77.91 81.445c-11.726 0-14.309-3.235-15.17-9.066-.1-.628-.633-1.379-1.272-1.379h-5.731c-.709 0-1.279.86-1.279 1.566 0 7.466 4.059 16.512 23.453 16.512 14.039 0 22.088-5.455 22.088-15.109 0-9.572-6.467-12.084-20.082-13.886-13.762-1.819-15.16-2.738-15.16-5.962 0-2.658 1.184-6.203 11.374-6.203 9.105 0 12.461 1.954 13.842 8.091.118.577.645.991 1.24.991h5.754c.354 0 .692-.143.94-.396.24-.272.367-.613.335-.979-.891-10.568-7.912-15.493-22.112-15.493-12.631 0-20.166 5.334-20.166 14.275 0 9.698 7.497 12.378 19.622 13.577 14.505 1.422 15.633 3.542 15.633 6.395 0 4.955-3.978 7.066-13.309 7.066z" /></svg>
      ),
    },
    {
      name: "TypeScript",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#fff" d="M22.67 47h99.67v73.67H22.67z" /><path data-name="original" fill="#007acc" d="M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z" /></svg>
      ),
    },
    {
      name: "PostgreSQL",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M93.809 92.112c.785-6.533.55-7.492 5.416-6.433l1.235.108c3.742.17 8.637-.602 11.513-1.938 6.191-2.873 9.861-7.668 3.758-6.409-13.924 2.873-14.881-1.842-14.881-1.842 14.703-21.815 20.849-49.508 15.543-56.287-14.47-18.489-39.517-9.746-39.936-9.52l-.134.025c-2.751-.571-5.83-.912-9.289-.968-6.301-.104-11.082 1.652-14.709 4.402 0 0-44.683-18.409-42.604 23.151.442 8.841 12.672 66.898 27.26 49.362 5.332-6.412 10.484-11.834 10.484-11.834 2.558 1.699 5.622 2.567 8.834 2.255l.249-.212c-.078.796-.044 1.575.099 2.497-3.757 4.199-2.653 4.936-10.166 6.482-7.602 1.566-3.136 4.355-.221 5.084 3.535.884 11.712 2.136 17.238-5.598l-.22.882c1.474 1.18 1.375 8.477 1.583 13.69.209 5.214.558 10.079 1.621 12.948 1.063 2.868 2.317 10.256 12.191 8.14 8.252-1.764 14.561-4.309 15.136-27.985" /><path d="M75.458 125.256c-4.367 0-7.211-1.689-8.938-3.32-2.607-2.46-3.641-5.629-4.259-7.522l-.267-.79c-1.244-3.358-1.666-8.193-1.916-14.419-.038-.935-.064-1.898-.093-2.919-.021-.747-.047-1.684-.085-2.664a18.8 18.8 0 01-4.962 1.568c-3.079.526-6.389.356-9.84-.507-2.435-.609-4.965-1.871-6.407-3.82-4.203 3.681-8.212 3.182-10.396 2.453-3.853-1.285-7.301-4.896-10.542-11.037-2.309-4.375-4.542-10.075-6.638-16.943-3.65-11.96-5.969-24.557-6.175-28.693C4.292 23.698 7.777 14.44 15.296 9.129 27.157.751 45.128 5.678 51.68 7.915c4.402-2.653 9.581-3.944 15.433-3.851 3.143.051 6.136.327 8.916.823 2.9-.912 8.628-2.221 15.185-2.139 12.081.144 22.092 4.852 28.949 13.615 4.894 6.252 2.474 19.381.597 26.651-2.642 10.226-7.271 21.102-12.957 30.57 1.544.011 3.781-.174 6.961-.831 6.274-1.295 8.109 2.069 8.607 3.575 1.995 6.042-6.677 10.608-9.382 11.864-3.466 1.609-9.117 2.589-13.745 2.377l-.202-.013-1.216-.107-.12 1.014-.116.991c-.311 11.999-2.025 19.598-5.552 24.619-3.697 5.264-8.835 6.739-13.361 7.709-1.544.33-2.947.474-4.219.474zm-9.19-43.671c2.819 2.256 3.066 6.501 3.287 14.434.028.99.054 1.927.089 2.802.106 2.65.355 8.855 1.327 11.477.137.371.26.747.39 1.146 1.083 3.316 1.626 4.979 6.309 3.978 3.931-.843 5.952-1.599 7.534-3.851 2.299-3.274 3.585-9.86 3.821-19.575l4.783.116-4.75-.57.14-1.186c.455-3.91.783-6.734 3.396-8.602 2.097-1.498 4.486-1.353 6.389-1.01-2.091-1.58-2.669-3.433-2.823-4.193l-.399-1.965 1.121-1.663c6.457-9.58 11.781-21.354 14.609-32.304 2.906-11.251 2.02-17.226 1.134-18.356-11.729-14.987-32.068-8.799-34.192-8.097l-.359.194-1.8.335-.922-.191c-2.542-.528-5.366-.82-8.393-.869-4.756-.08-8.593 1.044-11.739 3.431l-2.183 1.655-2.533-1.043c-5.412-2.213-21.308-6.662-29.696-.721-4.656 3.298-6.777 9.76-6.305 19.207.156 3.119 2.275 14.926 5.771 26.377 4.831 15.825 9.221 21.082 11.054 21.693.32.108 1.15-.537 1.976-1.529a270.708 270.708 0 0110.694-12.07l2.77-2.915 3.349 2.225c1.35.897 2.839 1.406 4.368 1.502l7.987-6.812-1.157 11.808c-.026.265-.039.626.065 1.296l.348 2.238-1.51 1.688-.174.196 4.388 2.025 1.836-2.301z" /><path fill="#336791" d="M115.731 77.44c-13.925 2.873-14.882-1.842-14.882-1.842 14.703-21.816 20.849-49.51 15.545-56.287C101.924.823 76.875 9.566 76.457 9.793l-.135.024c-2.751-.571-5.83-.911-9.291-.967-6.301-.103-11.08 1.652-14.707 4.402 0 0-44.684-18.408-42.606 23.151.442 8.842 12.672 66.899 27.26 49.363 5.332-6.412 10.483-11.834 10.483-11.834 2.559 1.699 5.622 2.567 8.833 2.255l.25-.212c-.078.796-.042 1.575.1 2.497-3.758 4.199-2.654 4.936-10.167 6.482-7.602 1.566-3.136 4.355-.22 5.084 3.534.884 11.712 2.136 17.237-5.598l-.221.882c1.473 1.18 2.507 7.672 2.334 13.557-.174 5.885-.29 9.926.871 13.082 1.16 3.156 2.316 10.256 12.192 8.14 8.252-1.768 12.528-6.351 13.124-13.995.422-5.435 1.377-4.631 1.438-9.49l.767-2.3c.884-7.367.14-9.743 5.225-8.638l1.235.108c3.742.17 8.639-.602 11.514-1.938 6.19-2.871 9.861-7.667 3.758-6.408z" /><path fill="#fff" d="M75.957 122.307c-8.232 0-10.84-6.519-11.907-9.185-1.562-3.907-1.899-19.069-1.551-31.503a1.59 1.59 0 011.64-1.55 1.594 1.594 0 011.55 1.639c-.401 14.341.168 27.337 1.324 30.229 1.804 4.509 4.54 8.453 12.275 6.796 7.343-1.575 10.093-4.359 11.318-11.46.94-5.449 2.799-20.951 3.028-24.01a1.593 1.593 0 011.71-1.472 1.597 1.597 0 011.472 1.71c-.239 3.185-2.089 18.657-3.065 24.315-1.446 8.387-5.185 12.191-13.794 14.037-1.463.313-2.792.453-4 .454zM31.321 90.466a6.71 6.71 0 01-2.116-.35c-5.347-1.784-10.44-10.492-15.138-25.885-3.576-11.717-5.842-23.947-6.041-27.922-.589-11.784 2.445-20.121 9.02-24.778 13.007-9.216 34.888-.44 35.813-.062a1.596 1.596 0 01-1.207 2.955c-.211-.086-21.193-8.492-32.768-.285-5.622 3.986-8.203 11.392-7.672 22.011.167 3.349 2.284 15.285 5.906 27.149 4.194 13.742 8.967 22.413 13.096 23.79.648.216 2.62.873 5.439-2.517A245.272 245.272 0 0145.88 73.046a1.596 1.596 0 012.304 2.208c-.048.05-4.847 5.067-10.077 11.359-2.477 2.979-4.851 3.853-6.786 3.853zm69.429-13.445a1.596 1.596 0 01-1.322-2.487c14.863-22.055 20.08-48.704 15.612-54.414-5.624-7.186-13.565-10.939-23.604-11.156-7.433-.16-13.341 1.738-14.307 2.069l-.243.099c-.971.305-1.716-.227-1.997-.849a1.6 1.6 0 01.631-2.025c.046-.027.192-.089.429-.176l-.021.006.021-.007c1.641-.601 7.639-2.4 15.068-2.315 11.108.118 20.284 4.401 26.534 12.388 2.957 3.779 2.964 12.485.019 23.887-3.002 11.625-8.651 24.118-15.497 34.277-.306.457-.81.703-1.323.703zm.76 10.21c-2.538 0-4.813-.358-6.175-1.174-1.4-.839-1.667-1.979-1.702-2.584-.382-6.71 3.32-7.878 5.208-8.411-.263-.398-.637-.866-1.024-1.349-1.101-1.376-2.609-3.26-3.771-6.078-.182-.44-.752-1.463-1.412-2.648-3.579-6.418-11.026-19.773-6.242-26.612 2.214-3.165 6.623-4.411 13.119-3.716C97.6 28.837 88.5 10.625 66.907 10.271c-6.494-.108-11.82 1.889-15.822 5.93-8.96 9.049-8.636 25.422-8.631 25.586a1.595 1.595 0 11-3.19.084c-.02-.727-.354-17.909 9.554-27.916C53.455 9.272 59.559 6.96 66.96 7.081c13.814.227 22.706 7.25 27.732 13.101 5.479 6.377 8.165 13.411 8.386 15.759.165 1.746-1.088 2.095-1.341 2.147l-.576.013c-6.375-1.021-10.465-.312-12.156 2.104-3.639 5.201 3.406 17.834 6.414 23.229.768 1.376 1.322 2.371 1.576 2.985.988 2.396 2.277 4.006 3.312 5.3.911 1.138 1.7 2.125 1.982 3.283.131.23 1.99 2.98 13.021.703 2.765-.57 4.423-.083 4.93 1.45.997 3.015-4.597 6.532-7.694 7.97-2.775 1.29-7.204 2.106-11.036 2.106zm-4.696-4.021c.35.353 2.101.962 5.727.806 3.224-.138 6.624-.839 8.664-1.786 2.609-1.212 4.351-2.567 5.253-3.492l-.5.092c-7.053 1.456-12.042 1.262-14.828-.577a6.162 6.162 0 01-.54-.401c-.302.119-.581.197-.78.253-1.58.443-3.214.902-2.996 5.105zm-45.562 8.915c-1.752 0-3.596-.239-5.479-.71-1.951-.488-5.24-1.957-5.19-4.37.057-2.707 3.994-3.519 5.476-3.824 5.354-1.103 5.703-1.545 7.376-3.67.488-.619 1.095-1.39 1.923-2.314 1.229-1.376 2.572-2.073 3.992-2.073.989 0 1.8.335 2.336.558 1.708.708 3.133 2.42 3.719 4.467.529 1.847.276 3.625-.71 5.006-3.237 4.533-7.886 6.93-13.443 6.93zm-7.222-4.943c.481.372 1.445.869 2.518 1.137 1.631.408 3.213.615 4.705.615 4.546 0 8.196-1.882 10.847-5.594.553-.774.387-1.757.239-2.274-.31-1.083-1.08-2.068-1.873-2.397-.43-.178-.787-.314-1.115-.314-.176 0-.712 0-1.614 1.009a41.146 41.146 0 00-1.794 2.162c-2.084 2.646-3.039 3.544-9.239 4.821-1.513.31-2.289.626-2.674.835zm12.269-7.36a1.596 1.596 0 01-1.575-1.354 8.218 8.218 0 01-.08-.799c-4.064-.076-7.985-1.82-10.962-4.926-3.764-3.927-5.477-9.368-4.699-14.927.845-6.037.529-11.366.359-14.229-.047-.796-.081-1.371-.079-1.769.003-.505.013-1.844 4.489-4.113 1.592-.807 4.784-2.215 8.271-2.576 5.777-.597 9.585 1.976 10.725 7.246 3.077 14.228.244 20.521-1.825 25.117-.385.856-.749 1.664-1.04 2.447l-.257.69c-1.093 2.931-2.038 5.463-1.748 7.354a1.595 1.595 0 01-1.335 1.819l-.244.02zM42.464 42.26l.062 1.139c.176 2.974.504 8.508-.384 14.86-.641 4.585.759 9.06 3.843 12.276 2.437 2.542 5.644 3.945 8.94 3.945h.068c.369-1.555.982-3.197 1.642-4.966l.255-.686c.329-.884.714-1.74 1.122-2.646 1.991-4.424 4.47-9.931 1.615-23.132-.565-2.615-1.936-4.128-4.189-4.627-4.628-1.022-11.525 2.459-12.974 3.837zm9.63-.677c-.08.564 1.033 2.07 2.485 2.271 1.449.203 2.689-.975 2.768-1.539.079-.564-1.033-1.186-2.485-1.388-1.451-.202-2.691.092-2.768.656zm2.818 2.826l-.407-.028c-.9-.125-1.81-.692-2.433-1.518-.219-.29-.576-.852-.505-1.354.101-.736.999-1.177 2.4-1.177.313 0 .639.023.967.069.766.106 1.477.327 2.002.62.91.508.977 1.075.936 1.368-.112.813-1.405 2.02-2.96 2.02zm-2.289-2.732c.045.348.907 1.496 2.029 1.651l.261.018c1.036 0 1.81-.815 1.901-1.082-.096-.182-.762-.634-2.025-.81a5.823 5.823 0 00-.821-.059c-.812 0-1.243.183-1.345.282zm43.605-1.245c.079.564-1.033 2.07-2.484 2.272-1.45.202-2.691-.975-2.771-1.539-.076-.564 1.036-1.187 2.486-1.388 1.45-.203 2.689.092 2.769.655zm-2.819 2.56c-1.396 0-2.601-1.086-2.7-1.791-.115-.846 1.278-1.489 2.712-1.688.316-.044.629-.066.93-.066 1.238 0 2.058.363 2.14.949.053.379-.238.964-.739 1.492-.331.347-1.026.948-1.973 1.079l-.37.025zm.943-3.013c-.276 0-.564.021-.856.061-1.441.201-2.301.779-2.259 1.089.048.341.968 1.332 2.173 1.332l.297-.021c.787-.109 1.378-.623 1.66-.919.443-.465.619-.903.598-1.052-.028-.198-.56-.49-1.613-.49zm3.965 32.843a1.594 1.594 0 01-1.324-2.483c3.398-5.075 2.776-10.25 2.175-15.255-.257-2.132-.521-4.337-.453-6.453.07-2.177.347-3.973.614-5.71.317-2.058.617-4.002.493-6.31a1.595 1.595 0 113.186-.172c.142 2.638-.197 4.838-.525 6.967-.253 1.643-.515 3.342-.578 5.327-.061 1.874.178 3.864.431 5.97.64 5.322 1.365 11.354-2.691 17.411a1.596 1.596 0 01-1.328.708z" /></svg>
      ),
    },
    {
      name: "Cloudinary",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 512 100"><path fill="#3448C5" d="M164.39 31.14a17.55 17.55 0 0 1 13.884 6.861a.707.707 0 0 0 1.024.113l5.847-4.66a.727.727 0 0 0 .113-1.023a26.623 26.623 0 0 0-21.104-10.373c-15.268 0-27.648 13.158-27.648 29.337c0 16.178 12.421 29.337 27.648 29.337a26.47 26.47 0 0 0 21.093-10.363a.707.707 0 0 0-.122-1.024l-5.837-4.608a.727.727 0 0 0-1.024.113a17.674 17.674 0 0 1-13.875 6.83c-10.434 0-18.595-8.91-18.595-20.265c0-11.356 8.16-20.275 18.595-20.275Zm28.404-10.751h7.332c.401 0 .727.325.727.727v58.14a.717.717 0 0 1-.717.718h-7.332a.727.727 0 0 1-.727-.727V21.116a.718.718 0 0 1 .603-.718l.114-.01Zm33.044 20.11c-9.718 0-19.548 6.882-19.548 20.04c0 11.56 8.407 20.285 19.548 20.285c11.14 0 19.63-8.725 19.63-20.285c0-11.561-8.438-20.04-19.63-20.04Zm10.782 20.04c0 6.676-4.638 11.714-10.782 11.714s-10.69-5.038-10.69-11.714c0-6.677 4.597-11.469 10.69-11.469c6.092 0 10.782 4.925 10.782 11.469Zm48.362-19.2h-7.331a.718.718 0 0 0-.727.717V61.51c0 7.598-5.243 10.291-9.738 10.291c-3.973 0-7.977-3-7.977-9.707v-20.04a.717.717 0 0 0-.727-.716h-7.332a.717.717 0 0 0-.716.717v20.991c0 11.52 5.212 17.858 14.683 17.858c3.44 0 9.011-1.976 11.1-6.338l.707.143v4.547c0 .401.325.727.727.727h7.331a.727.727 0 0 0 .727-.727v-37.2a.717.717 0 0 0-.727-.717Zm45.025-20.95h-7.342a.717.717 0 0 0-.717.727v25.988l-.45-.717c-2.233-3.594-7.035-5.918-12.237-5.918c-8.97 0-18.043 6.912-18.043 20.12c0 11.52 7.793 20.204 18.114 20.204c3.933 0 9.472-1.577 12.165-6l.45-.738v5.202a.717.717 0 0 0 .718.727h7.342a.717.717 0 0 0 .716-.727V21.116a.718.718 0 0 0-.603-.718l-.113-.01Zm-8.192 40.15a11.264 11.264 0 0 1-11.008 11.632c-6 0-10.7-5.12-10.7-11.632c0-6.513 4.7-11.469 10.7-11.469c6.189.157 11.092 5.279 10.977 11.469h.03Zm19.179-19.2h7.331c.396 0 .717.321.717.717v37.2c0 .397-.32.718-.717.718h-7.331a.727.727 0 0 1-.727-.727V42.056a.727.727 0 0 1 .727-.717Zm3.965-19.773h-.269a5.704 5.704 0 0 0-5.826 5.704a5.775 5.775 0 0 0 5.826 5.714a5.673 5.673 0 0 0 5.745-5.714a5.611 5.611 0 0 0-5.476-5.704ZM379.24 40.5c-3.215 0-8.929 1.731-11.11 6.339l-.707-.143v-4.64a.717.717 0 0 0-.727-.716h-7.331a.717.717 0 0 0-.717.717v37.2a.718.718 0 0 0 .717.728h7.331a.727.727 0 0 0 .728-.727V59.8c0-7.536 5.242-10.24 9.737-10.24c3.974 0 7.977 2.98 7.977 9.626v20.07c0 .401.326.727.727.727h7.352a.727.727 0 0 0 .727-.727v-20.98c-.02-11.459-5.242-17.777-14.704-17.777Zm58.5.84h-7.332a.717.717 0 0 0-.727.717v5.12l-.44-.717c-2.243-3.594-7.045-5.919-12.288-5.919c-8.96 0-18.042 6.912-18.042 20.122c0 11.52 7.792 20.202 18.124 20.202c3.922 0 9.462-1.576 12.165-6l.44-.737v5.13c0 .401.326.727.727.727h7.332a.717.717 0 0 0 .717-.727V42.056a.717.717 0 0 0-.676-.717Zm-8.192 19.2a11.264 11.264 0 0 1-11.038 11.632c-6.001 0-10.69-5.12-10.69-11.632c0-6.513 4.689-11.469 10.69-11.469c6.205.134 11.132 5.263 11.017 11.469h.021Zm41.645-19.067a13.988 13.988 0 0 0-5.263-1.024c-4.874 0-8.417 2.919-10.24 8.448l-.655-.092v-6.748a.717.717 0 0 0-.727-.717h-7.332a.717.717 0 0 0-.727.717v37.2c0 .402.325.728.727.728h7.414a.717.717 0 0 0 .716-.727V66.56c0-.619.01-1.216.03-1.792l.036-.85c.015-.277.032-.55.05-.818l.064-.788c.094-1.031.222-1.984.38-2.863l.124-.646c.475-2.32 1.168-4.099 1.983-5.457l.225-.36a9.7 9.7 0 0 1 1.2-1.508l.253-.246c.211-.199.426-.38.642-.543l.261-.19c.13-.09.262-.176.394-.256l.263-.152l.265-.139l.264-.125l.263-.113l.132-.052l.262-.095l.26-.083l.259-.073l.256-.062l.253-.053l.25-.044l.247-.035l.242-.027l.237-.019l.347-.016l.225-.003c1.386.004 2.759.263 4.049.764l.384.158a.737.737 0 0 0 .625 0c.19-.1.326-.281.369-.492l1.454-7.28a.727.727 0 0 0-.364-.786l-.097-.044Zm40.682.185a.707.707 0 0 0-.604-.318h-7.895a.738.738 0 0 0-.675.46l-9.554 24.76L483.5 41.8a.738.738 0 0 0-.676-.46h-8.048a.707.707 0 0 0-.594.318a.717.717 0 0 0-.072.675l14.336 35.205l-7.915 20.571a.727.727 0 0 0 .675 1.024h7.68a.707.707 0 0 0 .666-.46l22.384-56.32a.707.707 0 0 0-.008-.604l-.054-.091ZM36.244 36.313c.09 0 .177.036.24.1L47.862 47.8a.338.338 0 0 1-.236.574h-2.908a.348.348 0 0 0-.348.338v25.6a6.144 6.144 0 0 0 1.792 4.32l1.7 1.7a.338.338 0 0 1-.236.573H34.211a6.144 6.144 0 0 1-6.143-6.143v-26.05a.338.338 0 0 0-.338-.338h-2.868a.338.338 0 0 1-.245-.574l11.386-11.386c.064-.065.15-.1.241-.1Zm25.159 6.595c.09 0 .177.036.24.1L73.03 54.354a.338.338 0 0 1-.246.573h-2.908a.348.348 0 0 0-.338.348v19.036a6.144 6.144 0 0 0 1.782 4.321l1.71 1.7a.338.338 0 0 1-.246.573H59.401a6.144 6.144 0 0 1-6.144-6.143V55.296a.348.348 0 0 0-.338-.348h-2.897a.338.338 0 0 1-.236-.574l11.376-11.366a.34.34 0 0 1 .241-.1Zm25.164 6.523c.089 0 .174.036.236.1l11.386 11.376a.338.338 0 0 1-.235.584h-2.919a.338.338 0 0 0-.338.338V74.31a6.144 6.144 0 0 0 1.792 4.321l1.7 1.7a.338.338 0 0 1-.235.573H84.529a6.144 6.144 0 0 1-6.143-6.143V61.829a.338.338 0 0 0-.338-.338H75.18a.338.338 0 0 1-.236-.584l11.387-11.376a.328.328 0 0 1 .235-.1ZM61.173 0c17.885.13 33.66 11.745 39.095 28.785c13.283 1.734 23.25 13.003 23.346 26.398c0 11.056-6.914 20.243-18.077 24.068l-.415.139l-.512.164V71.3c7.096-2.99 11.263-8.899 11.263-16.118c-.036-10.186-8.103-18.504-18.242-18.892l-.343-.01h-3.072l-.737-2.929c-3.618-14.936-16.94-25.49-32.306-25.6A32.92 32.92 0 0 0 31.44 26.214L30.3 28.56l-2.15.225a22.824 22.824 0 0 0-9.867 41.925l.354.222v8.704h-.051l-.768-.348A30.596 30.596 0 0 1 25.2 21.372A40.574 40.574 0 0 1 61.173 0Z" /></svg>
      ),
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="reveal">
            <p className="text-indigo-400 font-medium mb-4 tracking-wider text-sm uppercase">
              Full Stack Developer & Digital Craftsman
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Building Digital<br />
              <span className="gradient-text">Experiences</span> That Matter
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              I craft high-performance websites, mobile applications, and digital tools that help businesses grow and creators shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#projects" className="btn-primary px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center gap-2">
                View My Work
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#contact" className="btn-outline px-8 py-4 rounded-full font-medium text-lg inline-flex items-center justify-center gap-2">
                Start a Project
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 reveal">
            {[
              { value: "10", label: "Projects Delivered" },
              { value: "5", label: "Happy Clients" },
              { value: "3", label: "Years Experience" },
              { value: "100", label: "% Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6">
                <div className="stat-number text-3xl md:text-4xl font-bold gradient-text" data-target={stat.value}>{stat.value}</div>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What I <span className="gradient-text">Create</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">End-to-end digital solutions tailored to your unique needs and goals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="service-card glass rounded-2xl p-8 reveal">
                <div className="service-icon w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  {service.ul.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured <span className="gradient-text">Projects</span></h2>
              <p className="text-gray-400 max-w-xl">A selection of my recent work showcasing different technologies and solutions.</p>
            </div>
            <a href="/projects" className="mt-4 md:mt-0 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors">
              View All Projects
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.slice(0, 3).map((project) => (
              <div key={project.id} className="project-card glass rounded-2xl overflow-hidden reveal">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
                  <div className="h-48 overflow-hidden">
                    <Image src={project.image} alt={project.title} width={400} height={200} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">{project.type}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tools.slice(0, 3).map((tool) => (
                      <span key={tool} className="tech-tag px-3 py-1 rounded-full text-xs">{tool}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a href={project.link} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Live Demo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a href="https://github.com/joshosim" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1">
                      GitHub
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-2xl" />
                <div className="glass-strong rounded-3xl p-8 relative">
                  <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Image src={Avatar} alt="Osim Uka" className="w-full h-80 object-cover rounded-xl border-4 border-white shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Behind the <span className="gradient-text">Code</span></h2>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                I'm Osim Uka, a passionate full-stack developer with a love for creating digital experiences that make a difference. With 3+ years of experience, I've helped businesses transform their ideas into reality.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                My approach combines technical expertise with creative problem-solving. I don't just write code—I craft solutions that drive results, whether that's increasing conversions, streamlining operations, or creating delightful user experiences.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {["Problem Solver", "Detail Oriented", "Fast Learner", "Team Player"].map((trait) => (
                  <div key={trait} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">{trait}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="btn-primary px-8 py-3 rounded-full font-medium inline-flex items-center gap-2">
                Let's Work Together
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Client <span className="gradient-text">Stories</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Don't just take my word for it—here's what clients say about working with me.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card glass rounded-2xl p-8 reveal">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tech <span className="gradient-text">Stack</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Modern tools and technologies I use to build exceptional digital experiences.</p>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 reveal">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
              {techStack.map((tech) => (
                <div key={tech.name} className="flex flex-col items-center gap-3 group">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    {tech.icon}
                  </div>
                  <span className="text-sm text-gray-400">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}

      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="reveal">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Create<br /><span className="gradient-text">Something
                Amazing</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Have a project in mind? I'd love to hear about it. Whether you need a complete web application, mobile app,
                or landing page, let's discuss how I can help bring your vision to life.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">hello@buildwithosim.site</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">Available Worldwide</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Response Time</p>
                    <p className="font-medium">Within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <a href="https://github.com/joshosim" target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-500/20 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/uka-osim-9761601a0/" target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-500/20 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="https://x.com/teamjojo_code" target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-500/20 transition-colors group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 reveal">
              <form id="contact-form" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input type="text" className="form-input w-full px-4 py-3 rounded-xl text-white" placeholder="Osim Uka.."
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" className="form-input w-full px-4 py-3 rounded-xl text-white"
                      placeholder="osimuka@yahoo.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Type</label>
                  <select className="form-input w-full px-4 py-3 rounded-xl text-white bg-black">
                    <option>Web Development</option>
                    <option>Mobile App</option>
                    <option>Landing Page</option>
                    <option>Digital Tool</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>

                  <input type="text" className="form-input w-full px-4 py-3 rounded-xl text-white"
                    placeholder="₦100k or $100..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea className="form-input w-full px-4 py-3 rounded-xl text-white h-32 resize-none"
                    placeholder="Tell me about your project..." required></textarea>
                </div>
                <button type="submit"
                  className="btn-primary w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2">
                  Send Message
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
