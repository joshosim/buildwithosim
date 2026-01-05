import { Download, Code, Palette, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const navigate = useRouter();

  const handleDownload = async () => {
    const pdfUrl = "MyResume.pdf";
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "osim.uka.resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block mb-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full">
            🌍 Available for Projects
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
            Hi, I'm Osim Uka 👋
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 font-normal max-w-2xl mx-auto">
            Software Developer • Creative Designer • Digital Creator
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            I build modern web & mobile applications, create digital products, and share insights on personal development and finance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-base flex items-center gap-2 hover:shadow-lg transition-all"
              onClick={() => navigate.push('/projects')}
            >
              View Projects
              <ArrowRight size={20} />
            </button>
            <button
              className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-all"
              onClick={() => navigate.push('/shop')}
            >
              Digital Products
            </button>
            <button
              className="text-blue-500 px-6 py-3 rounded-lg font-semibold text-base flex items-center gap-2 hover:bg-blue-50 transition-all"
              onClick={handleDownload}
            >
              <Download size={20} />
              Resume
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            { icon: Code, title: 'Development', desc: 'React, TypeScript, Mobile Apps', color: 'text-blue-500' },
            { icon: Palette, title: 'Design', desc: 'UI/UX, Graphics, Branding', color: 'text-purple-600' },
            { icon: TrendingUp, title: 'Digital Products', desc: 'Templates, Guides, Resources', color: 'text-pink-400' }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <div className="p-8 rounded-2xl bg-white shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                <item.icon size={48} className={`${item.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
