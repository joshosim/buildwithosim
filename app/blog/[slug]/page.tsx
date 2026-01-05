
'use client';

import { Calendar, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

const blogPosts = [
  {
    id: 1,
    title: "5 Skills to Learn Before 2026 That Will Make You Money",
    excerpt: "Discover the most valuable skills that can transform your career and income in the digital age.",
    content: `In today's rapidly evolving digital landscape, acquiring the right skills can be the difference between thriving and merely surviving. Here are five essential skills you should master before 2026:

1. **AI and Machine Learning Basics**
Understanding AI isn't just for data scientists anymore. Basic knowledge of how AI works, prompt engineering, and leveraging AI tools can 10x your productivity in any field.

2. **Digital Marketing & Content Creation**
The ability to market yourself or your business online is invaluable. Learn SEO, social media marketing, and content creation to build your personal brand.

3. **Web Development**
Even basic coding skills can open doors. Learn HTML, CSS, JavaScript, and frameworks like React to build websites and web applications.

4. **Financial Literacy & Investment**
Understanding money management, investing, and building passive income streams is crucial for long-term wealth.

5. **Communication & Storytelling**
The ability to communicate ideas clearly and tell compelling stories is essential in any career. Master writing, public speaking, and presentation skills.

Start learning these skills today, and you'll be well-positioned for success in 2026 and beyond.`,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    category: "Personal Development",
    date: "2025-01-15",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "How to Start Coding with No Laptop",
    excerpt: "Learn programming even with limited resources. Practical tips for aspiring developers.",
    content: `Don't let the lack of a laptop stop you from learning to code. Here's how you can start your programming journey with just a smartphone:

**1. Use Mobile Coding Apps**
Apps like SoloLearn, Grasshopper, and Mimo offer interactive coding lessons right on your phone. They're perfect for learning the basics.

**2. Online Code Editors**
Websites like Replit, CodePen, and JSFiddle work on mobile browsers. You can write and run code directly from your phone.

**3. YouTube Tutorials**
Watch coding tutorials on YouTube. Take notes and practice the concepts when you get access to a computer.

**4. Join Coding Communities**
Engage with communities on Discord, Reddit, or WhatsApp. Ask questions, share your progress, and learn from others.

**5. Visit Cyber Cafes or Libraries**
Use public computers at libraries or affordable cyber cafes to practice coding for a few hours each week.

**6. Save for a Budget Laptop**
While learning on mobile, save money for a basic laptop. You don't need an expensive machine to start coding.

Remember, many successful developers started with limited resources. Your determination matters more than your equipment.`,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    category: "Tech",
    date: "2025-01-10",
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Simple Savings Challenge for Beginners",
    excerpt: "Start your financial journey with this easy-to-follow savings plan.",
    content: `Building a savings habit doesn't have to be complicated. Try this simple 52-week savings challenge:

**How It Works:**
- Week 1: Save ₦100
- Week 2: Save ₦200
- Week 3: Save ₦300
- Continue increasing by ₦100 each week

By the end of 52 weeks, you'll have saved ₦137,800!

**Tips for Success:**

1. **Automate Your Savings**
Set up automatic transfers to a separate savings account each week.

2. **Start Small**
If ₦100 per week is too much, start with ₦50 or even ₦20. The habit matters more than the amount.

3. **Track Your Progress**
Use a savings tracker app or spreadsheet to visualize your progress.

4. **Avoid Temptation**
Keep your savings in a separate account that's not easily accessible.

5. **Celebrate Milestones**
Reward yourself (modestly) when you hit savings goals like ₦10,000, ₦50,000, etc.

6. **Find Extra Income**
Look for side hustles or freelance work to boost your savings rate.

**Alternative Approach:**
If increasing amounts feel overwhelming, save the same amount each week. Even ₦500/week adds up to ₦26,000 in a year!

The key is consistency. Start today, no matter how small the amount.`,
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800",
    category: "Finance",
    date: "2025-01-05",
    readTime: "4 min read"
  }
];
// export default async function BlogPostPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>
// }) {
//   const { slug } = await params
//   const post = await getPost(slug)
export default function BlogDetail() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div>

        <div className="max-w-4xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold">Blog post not found</h1>
        </div>

      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-block mb-6 px-4 py-2 bg-[#fdbe21] text-white font-semibold rounded-full">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            {post.title}
          </h1>
          <div className="flex gap-6 mb-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm">{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm">{post.readTime}</span>
            </div>
          </div>
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-96 object-cover" />
          </div>
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg">
            <div className="text-base md:text-lg leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
