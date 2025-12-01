'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  UserCheck,
  Truck,
  MessageCircle,
  Store,
  Upload,
  Heart,
  Plus,
  Camera,
  ArrowRight,
  Star,
  Quote,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import UploadModal from '@/components/ui/UploadModal';

// --- Mock Data ---
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Dolo 650mg Tablet",
    category: "Medicines",
    price: 30,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    description: "Paracetamol (650mg) used for fever and mild to moderate pain relief."
  },
  {
    id: 4,
    name: "Pampers Active Baby (L)",
    category: "Baby Care",
    price: 399,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
    description: "Soft and comfortable diapers for babies."
  },
  {
    id: 6,
    name: "Multivitamin Gold Daily",
    category: "Vitamins",
    price: 349,
    image: "https://images.unsplash.com/photo-1550572017-4d1b0d31f630?w=400&h=400&fit=crop",
    description: "Daily immunity and energy booster."
  },
  {
    id: 7,
    name: "Cetaphil Gentle Cleanser",
    category: "Personal Care",
    price: 450,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    description: "Dermatologist recommended for sensitive skin."
  }
];

const CATEGORIES = [
  { name: "Medicines", icon: "💊", color: "bg-blue-100 text-blue-600" },
  { name: "Personal Care", icon: "🧴", color: "bg-pink-100 text-pink-600" },
  { name: "Baby Care", icon: "👶", color: "bg-yellow-100 text-yellow-600" },
  { name: "Health Devices", icon: "🩺", color: "bg-purple-100 text-purple-600" },
  { name: "Vitamins", icon: "🥗", color: "bg-green-100 text-green-600" },
  { name: "Ayurveda", icon: "🌿", color: "bg-emerald-100 text-emerald-600" },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Regular Customer",
    text: "PulseKart has been a lifesaver! The delivery is always on time, and the pharmacists are very helpful.",
    rating: 5
  },
  {
    id: 2,
    name: "Priya Singh",
    role: "Mother of two",
    text: "I love the baby care section. Genuine products and great discounts. Highly recommended!",
    rating: 5
  },
  {
    id: 3,
    name: "Amit Verma",
    role: "Senior Citizen",
    text: "Ordering medicines via WhatsApp is so easy. Thank you PulseKart for the excellent service.",
    rating: 4
  }
];

const Button = ({ children, variant = "primary", className = "", onClick, icon: Icon }: any) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95";

  const variants: any = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md",
    hero: "bg-[#5eead4] text-[#134e4a] hover:bg-[#2dd4bf]",
    heroOutline: "border border-white/30 text-white hover:bg-white/10",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Hero Section */}
      <section className="relative bg-[#0f766e] overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#14b8a6] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2dd4bf] rounded-full filter blur-3xl opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-teal-800/50 rounded-full px-4 py-1.5 text-teal-200 text-sm font-medium mb-6 border border-teal-700/50 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                Trusted by 50,000+ Families
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Your Health, <br />
                <span className="text-teal-300">Delivered Instantly.</span>
              </h1>

              <p className="text-lg text-teal-100 mb-2 max-w-xl leading-relaxed">
                Genuine medicines, expert consultations, and rapid delivery right to your doorstep.
              </p>
              <p className="text-sm text-teal-300/80 mb-8 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Powered by verified pharmacists & AI safety checks.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/consult">
                  <Button variant="hero" className="px-8 py-4 text-lg shadow-lg shadow-teal-900/20 w-full sm:w-auto" icon={MessageCircle}>
                    Start Consultation
                  </Button>
                </Link>
                <Button variant="heroOutline" className="px-8 py-4 text-lg w-full sm:w-auto" icon={Upload} onClick={() => setIsUploadModalOpen(true)}>
                  Upload Prescription
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-teal-800/50">
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-teal-300" />
                  </div>
                  <div className="text-xs text-teal-100 leading-tight font-medium">
                    100% Secure<br />Payments
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Lock className="w-6 h-6 text-teal-300" />
                  </div>
                  <div className="text-xs text-teal-100 leading-tight font-medium">
                    Encrypted<br />Data Privacy
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-teal-300" />
                  </div>
                  <div className="text-xs text-teal-100 leading-tight font-medium">
                    AI-Enhanced<br />Safety Checks
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Floating Image Effect */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80"
                  alt="Pharmacist"
                  className="rounded-3xl shadow-2xl border-4 border-white/10"
                />

                {/* Floating Card 1 */}
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-8 top-12 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-[200px]"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Delivery Status</p>
                    <p className="text-sm font-bold text-gray-900">Arriving in 15m</p>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -right-8 bottom-12 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pharmacist</p>
                    <p className="text-sm font-bold text-gray-900">Verified & Live</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-500">Essentials for your daily wellness.</p>
            </div>
            <Link href="/shop" className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((cat, i) => (
              <Link
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                key={i}
              >
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="h-full flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-100 transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {cat.name === "Medicines" && "Prescription & OTC drugs"}
                    {cat.name === "Personal Care" && "Skin, hair & body care"}
                    {cat.name === "Baby Care" && "Diapers, wipes & food"}
                    {cat.name === "Health Devices" && "BP monitors & more"}
                    {cat.name === "Vitamins" && "Immunity & supplements"}
                    {cat.name === "Ayurveda" && "Natural herbal remedies"}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Health Goals Section */}
      <section className="py-12 bg-teal-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Health Goal</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Diabetes Care", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
              { title: "Heart Health", img: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&q=80" },
              { title: "Stomach Care", img: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=400&q=80" },
              { title: "Immunity Boost", img: "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf8?w=400&q=80" }
            ].map((goal, i) => (
              <div key={i} className="relative h-32 rounded-xl overflow-hidden cursor-pointer group">
                <img src={goal.img} alt={goal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span className="text-white font-bold">{goal.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <div className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/shop" className="text-[#14b8a6] font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why PulseKart?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We combine technology with care to deliver the best healthcare experience.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle, title: "100% Genuine", desc: "Sourced directly from manufacturers." },
              { icon: UserCheck, title: "Verified Pharmacists", desc: "Every order checked by experts." },
              { icon: Truck, title: "45-Min Delivery", desc: "Superfast delivery in selected areas." },
              { icon: Sparkles, title: "AI Health Assistant", desc: "Instant guidance on symptoms & care." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-colors group cursor-default"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-teal-500 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#0f5132] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Families</h2>
            <div className="flex justify-center items-center gap-2 text-teal-200">
              <Star className="w-5 h-5 fill-current text-yellow-400" />
              <span className="font-bold text-white">4.8/5</span>
              <span>from 2000+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/15 transition-all"
              >
                <Quote className="w-10 h-10 text-teal-400 mb-6 opacity-50" />
                <p className="text-lg text-gray-100 mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-teal-200">
                      <span>India</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-white">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </section>

      {/* CTA Banner */}
      <div className="bg-[#f0fdfa] border-y border-teal-100 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#134e4a] mb-2">Have a doctor's prescription?</h2>
            <p className="text-teal-800">Don't search for medicines one by one. Simply upload your prescription and our pharmacists will pack it for you.</p>
          </div>
          <Button
            variant="primary"
            className="px-8 py-3"
            icon={Camera}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Now
          </Button>
        </div>
      </div>

    </div>
  );
}
