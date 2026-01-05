import { Download, ShoppingCart } from 'lucide-react';

const products = [
  {
    id: 1,
    title: "Productivity Planner 2026",
    description: "Complete Notion template for planning your year, months, weeks, and daily tasks.",
    price: "Free",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
    category: "Notion Templates",
    downloads: 0
  },
  {
    id: 2,
    title: "Finance Tracker Bundle",
    description: "Track your income, expenses, savings goals, and budget with beautiful printable sheets.",
    price: "$5",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    category: "Printables",
    downloads: 0
  },
  {
    id: 3,
    title: "Beginner Crochet Patterns",
    description: "5 easy crochet patterns perfect for beginners with step-by-step instructions.",
    price: "$3",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
    category: "Crochet",
    downloads: 0
  },
  {
    id: 4,
    title: "Social Media Design Templates",
    description: "50+ Canva templates for Instagram, Pinterest, and Facebook posts.",
    price: "$10",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
    category: "Design",
    downloads: 0
  }
];

export default function Shop() {
  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#fdbe21]">
            Digital Products
          </h2>
          <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto">
            Templates, guides, and resources to boost your productivity and creativity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col h-full bg-white rounded-lg shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-t-lg" />
              <div className="p-6 flex-grow flex flex-col">
                <span className="inline-block mb-4 px-3 py-1 bg-[#fdbe21] text-white text-xs font-semibold rounded-full w-fit">
                  {product.category}
                </span>
                <h3 className="text-xl font-semibold mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-3xl font-bold text-[#fdbe21]">
                    {product.price}
                  </span>
                  <button className="bg-[#fdbe21] hover:bg-[#ff9a00] text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    {product.price === "Free" ? <Download size={16} /> : <ShoppingCart size={16} />}
                    {product.price === "Free" ? "Download" : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-12 bg-[#fdbe21]/10 rounded-2xl text-center border-2 border-dashed border-[#fdbe21]/30">
          <h3 className="text-3xl font-bold mb-4 text-[#fdbe21]">
            More Products Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            Website templates, coding guides, productivity tools, and more digital resources.
          </p>
          <button className="border-2 border-[#fdbe21] text-[#fdbe21] font-semibold px-8 py-2 rounded-lg hover:bg-[#fdbe21]/10 transition-colors">
            Get Notified
          </button>
        </div>
      </div>
    </div>
  );
}
