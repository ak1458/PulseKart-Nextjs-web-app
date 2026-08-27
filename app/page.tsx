'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  BabyBottle,
  UserCheck,
  Truck,
  Pill,
  Stethoscope,
  Leaf,
  FlaskConical,
  MessageCircle,
  Upload,
  Heart,
  Camera,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award
} from '@/lib/icons';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import UploadModal from '@/components/ui/UploadModal';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/lib/images';
import { isPrescriptionProduct } from '@/lib/utils';
import { apiUrl } from '@/lib/api';

/**
 * A product as the homepage renders it.
 *
 * The API returns `title` and `images[]`; this page's markup wants `name` and a
 * single `image`, so the fetch normalises rather than the markup reaching into
 * two shapes.
 */
interface FeaturedProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    prescription_required?: boolean;
}

/**
 * Health goals and the "why us" panel are marketing copy, not data.
 *
 * They were `any[] = []`, so both sections rendered a placeholder reading
 * "Health goal categories will appear here" to every visitor. Standing up an
 * API for static copy would be over-engineering; the artwork already ships in
 * public/images.
 */
const HEALTH_GOALS = [
    { title: 'Immunity', img: '/images/goal-immunity.svg', slug: 'immunity' },
    { title: 'Heart Health', img: '/images/goal-heart.svg', slug: 'heart' },
    { title: 'Diabetes Care', img: '/images/goal-diabetes.svg', slug: 'diabetes' },
    { title: 'Digestion', img: '/images/goal-stomach.svg', slug: 'digestion' },
];

const WHY_FEATURES = [
    {
        icon: ShieldCheck,
        title: 'Verified by pharmacists',
        desc: 'Every prescription order is checked by a registered pharmacist before it is dispensed.',
    },
    {
        icon: Truck,
        title: 'Delivered the same day',
        desc: 'Order before 6 PM in serviceable pincodes and it reaches you the same evening.',
    },
    {
        icon: Award,
        title: 'Genuine stock only',
        desc: 'Sourced from licensed distributors, with batch and expiry tracked on every item.',
    },
    {
        icon: MessageCircle,
        title: 'Support that answers',
        desc: 'Talk to a person about your order or your prescription, seven days a week.',
    },
];

const CATEGORIES = [
  { name: "Medicines", icon: Pill, tone: "text-teal-300" },
  { name: "Personal Care", icon: Heart, tone: "text-rose-300" },
  { name: "Baby Care", icon: BabyBottle, tone: "text-amber-300" },
  { name: "Health Devices", icon: Stethoscope, tone: "text-sky-300" },
  { name: "Vitamins", icon: FlaskConical, tone: "text-emerald-300" },
  { name: "Ayurveda", icon: Leaf, tone: "text-lime-300" },
];

const MOBILE_CATEGORIES = [
  { name: "Medicines", href: "/shop?category=Medicines", icon: Pill },
  { name: "Personal Care", href: "/shop?category=Personal%20Care", icon: Heart },
  { name: "Devices", href: "/shop?category=Health%20Devices", icon: Stethoscope },
  { name: "Vitamins", href: "/shop?category=Vitamins", icon: FlaskConical },
];

const MOBILE_TRUST = [
  { label: "Verified Pharmacy", icon: ShieldCheck },
  { label: "Fast Delivery", icon: Truck },
  { label: "Pharmacist Support", icon: UserCheck },
];

const MOBILE_WHY = [
  { label: "Verified medicines only", icon: ShieldCheck },
  { label: "45-min delivery in select areas", icon: Truck },
  { label: "Pharmacist chat support", icon: UserCheck },
];

export default function Home() {
  // Featured products come from the catalogue. This was `any[] = []`, so the
  // homepage showed an empty-state placeholder instead of anything to buy.
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(apiUrl('products?limit=8'))
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('unavailable'))))
      .then((data: Record<string, unknown>[]) => {
        if (cancelled || !Array.isArray(data)) return;
        setFeaturedProducts(
          data.map(item => ({
            id: Number(item.id),
            name: String(item.title ?? item.name ?? 'Unnamed product'),
            category: String(item.category ?? ''),
            price: Number(item.price ?? 0),
            image: Array.isArray(item.images) ? String(item.images[0] ?? '') : '',
            prescription_required: item.prescription_required === true,
          })),
        );
      })
      .catch(() => {
        // The catalogue being unreachable must not blank the whole homepage;
        // the section falls back to its empty state.
      });

    return () => { cancelled = true; };
  }, []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { addToCart } = useCart();

  return (
    <div className="animate-fade-in bg-[#030712] min-h-screen">
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

      {/* Mobile-first layout */}
      <div className="md:hidden space-y-8 pb-10">
        <section className="px-4 pt-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-[0.25em]">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                PulseKart Pharmacy
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Your Health,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                  Delivered.
                </span>
              </h1>
              <p className="text-sm text-gray-400">
                Verified medicines, fast delivery, pharmacist support.
              </p>
              <Link href="/shop" className="w-full">
                <button className="w-full btn-gradient py-4 rounded-2xl text-white font-bold text-base">
                  Shop Medicines
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/10 grid grid-cols-3 gap-3">
            {MOBILE_TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 text-[10px] text-gray-300">
                  <Icon className="w-4 h-4 text-teal-300" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Core Categories</h2>
            <Link href="/shop" className="text-xs text-teal-300 font-semibold">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOBILE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} href={cat.href} className="glass-panel rounded-2xl p-4 border border-white/10 min-h-[110px] flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    <p className="text-[10px] text-gray-500">Tap to explore</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Featured</h2>
            <Link href="/shop" className="text-xs text-teal-300 font-semibold">
              View all
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="space-y-5">
              {featuredProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                  <div className="relative h-44">
                    <img src={getProductImage(product.image)} alt={product.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, requiresPrescription: isPrescriptionProduct(product) })}
                      className="absolute bottom-3 right-3 px-4 py-2 bg-teal-500 text-white text-xs font-bold rounded-full shadow-[0_10px_20px_rgba(20,184,166,0.4)]"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-lg font-bold text-white">{product.name}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">â‚¹{product.price}</span>
                      <span className="text-[10px] text-teal-300 font-semibold">Best Seller</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Coming Soon</h3>
              <p className="text-sm text-gray-400">Featured products will appear here</p>
            </div>
          )}
        </section>

        <section className="px-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">DoctorÃ¢â‚¬â„¢s prescription?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload once. WeÃ¢â‚¬â„¢ll verify and pack your order.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full btn-gradient py-3.5 rounded-xl text-white font-bold"
            >
              Upload Now
            </button>
          </div>
        </section>

        <section className="px-4">
          <h2 className="text-lg font-bold text-white mb-4">Why PulseKart</h2>
          <div className="space-y-3">
            {MOBILE_WHY.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 glass-panel rounded-xl p-3 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-teal-300" />
                  </div>
                  <p className="text-sm text-gray-300">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="hidden md:block">
        {/* Hero Section */}
        <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-teal-500/10 via-purple-500/5 to-transparent blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <img src="/vectors/mesh-1.svg" alt="" className="absolute -top-20 -left-40 w-[900px] opacity-70 mix-blend-screen" />
            <img src="/vectors/grid-wave.svg" alt="" className="absolute -bottom-40 right-0 w-[900px] opacity-40 mix-blend-screen" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur-md mb-8 hover:bg-teal-500/20 transition-colors cursor-default">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                  <span className="text-teal-300 text-sm font-bold tracking-wide">Your Trusted Pharmacy</span>
                </div>

                <h1 className="text-6xl lg:text-8xl font-display font-bold text-white leading-[1.1] mb-8 tracking-tight">
                  Your Health, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 animate-gradient-shift bg-[length:200%_auto]">
                    Delivered.
                  </span>
                </h1>

                <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed font-light">
                  Experience the upgrade. <span className="text-white font-medium">AI-powered diagnostics</span>, verified experts, and rapid delivery. changing healthcare, one tap at a time.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 mb-16">
                  <Link href="/consult">
                    <button className="w-full sm:w-auto px-10 py-5 rounded-full btn-gradient text-white font-bold text-lg flex items-center justify-center gap-3 group">
                      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      Start Consultation
                    </button>
                  </Link>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-full sm:w-auto px-10 py-5 rounded-full glass-button text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/5"
                  >
                    <Upload className="w-6 h-6" />
                    Upload Prescription
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-teal-400 border border-white/10 group-hover:border-teal-500/30 transition-colors">
                      <ShieldCheck className="w-7 h-7 icon-glow" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">100% Secure</p>
                      <p className="text-gray-500 text-sm">Payments & Data</p>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                      <Sparkles className="w-7 h-7 icon-glow" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">AI Safety</p>
                      <p className="text-gray-500 text-sm">Verified Checks</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Hero Image Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10 p-4 glass-panel rounded-[2.5rem] rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl -z-10"></div>
                  <img
                    src="/images/hero-pharmacist.svg"
                    alt="PulseKart workspace"
                    className="rounded-[2rem] shadow-2xl w-full h-auto object-cover transform translate-z-0"
                  />

                  {/* Floating Card 1 - Status */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-12 top-24 glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                  >
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
                      <p className="text-lg font-bold text-white">Arriving in 15m</p>
                    </div>
                  </motion.div>

                  {/* Floating Card 2 - Expert */}
                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-8 bottom-24 glass-panel p-5 rounded-2xl flex items-center gap-4 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/30">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Expert</p>
                      <p className="text-lg font-bold text-white">Verified Pharmacist</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Shop by Category</h2>
                <p className="text-gray-400">Essentials for your daily wellness.</p>
              </div>
              <Link href="/shop" className="text-teal-400 font-bold hover:text-teal-300 flex items-center gap-1 transition-colors">
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
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="h-full flex flex-col items-center text-center p-6 rounded-2xl glass-panel group cursor-pointer hover:bg-white/10"
                  >
                    <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <cat.icon className={`w-6 h-6 ${cat.tone}`} />
                    </div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{cat.name}</h3>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Explore</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Health Goals Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Shop by Health Goal</h2>
            {HEALTH_GOALS.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {HEALTH_GOALS.map((goal, i) => (
                  <div key={i} className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-lg">
                    <img src={goal.img} alt={goal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-5">
                      <div>
                        <span className="block text-xs text-teal-300 font-bold uppercase tracking-wider mb-1">Goal</span>
                        <span className="text-xl font-bold text-white">{goal.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-gray-400">Health goal categories will appear here</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Featured Products</h2>
              <Link href="/shop" className="text-teal-400 font-bold hover:text-teal-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-teal-400" />
                </div>
                <h3 className="text-2xl text-white font-bold mb-3">Coming Soon</h3>
                <p className="text-gray-400 max-w-md mx-auto">Our featured products will appear here. Visit the shop to explore our catalog.</p>
                <Link href="/shop" className="mt-6 inline-flex items-center gap-2 px-6 py-3 btn-gradient rounded-full text-white font-bold">
                  Browse Shop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Why Choose Us */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Why PulseKart?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">We combine technology with care to deliver the best healthcare experience.</p>
            </div>

            {WHY_FEATURES.length > 0 ? (
              <div className="grid md:grid-cols-4 gap-8">
                {WHY_FEATURES.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="text-center p-8 rounded-2xl glass-panel group hover:bg-white/10"
                  >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-300 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-light">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-gray-400">Features information will appear here</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="glass-panel p-12 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
              <img src="/vectors/halo-lines.svg" alt="" className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen -z-10 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold text-white mb-4">Have a doctor's prescription?</h2>
                  <p className="text-lg text-gray-300 font-light leading-relaxed">
                    Don't type. Just snap a photo. Our AI will digitize it and our pharmacists will pack your order perfectly.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <Camera className="w-6 h-6" />
                  Upload Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





