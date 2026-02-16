"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  Send,
  CheckCircle,
} from "@/lib/icons";

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the 'Orders' section. Alternatively, use the 'Track Order' link at the bottom of our website with your order ID.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for unopened medicines and 30-day return for other health products. Prescription medicines cannot be returned once dispensed. Please contact our support team to initiate a return.",
  },
  {
    question: "How do I upload my prescription?",
    answer:
      "You can upload your prescription during checkout or from your account dashboard under 'Prescriptions'. We accept JPG, PNG, and PDF formats up to 5MB.",
  },
  {
    question: "What are your delivery hours?",
    answer:
      "We deliver 7 days a week from 8 AM to 10 PM. Express delivery options are available for urgent orders in select locations.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes, we use bank-grade encryption (256-bit SSL) to protect your data. We are ISO 27001 certified and comply with all healthcare data protection regulations.",
  },
];

const contactMethods = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    value: "1800-123-4567",
    subtext: "Mon-Sat, 8 AM - 10 PM",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "We'll respond within 24 hours",
    value: "support@pulsekart.com",
    subtext: "For detailed inquiries",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant messaging support",
    value: "Start Chat",
    subtext: "Available 24/7",
    isButton: true,
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-6">
              <AlertCircle className="w-4 h-4" />
              We're here to help
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Customer <span className="text-teal-400">Support</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get answers to your questions or reach out to our dedicated support team. 
              We're available 24/7 to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-teal-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                  <method.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{method.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{method.description}</p>
                {method.isButton ? (
                  <button className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                    {method.value} →
                  </button>
                ) : (
                  <>
                    <p className="text-white font-medium">{method.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{method.subtext}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Contact Form */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-medium text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Send us a Message</h2>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">
                    We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all text-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all text-sm"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all text-sm appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-gray-900">
                        Select a topic
                      </option>
                      <option value="order" className="bg-gray-900">
                        Order Issue
                      </option>
                      <option value="prescription" className="bg-gray-900">
                        Prescription Query
                      </option>
                      <option value="delivery" className="bg-gray-900">
                        Delivery Question
                      </option>
                      <option value="return" className="bg-gray-900">
                        Return/Refund
                      </option>
                      <option value="other" className="bg-gray-900">
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 outline-none transition-all text-sm resize-none"
                      placeholder="Describe your issue or question..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Working Hours */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Support Hours</h2>
            <p className="text-gray-400 mb-6">
              Our team is available to assist you during the following hours
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-500 mb-1">Phone Support</p>
                <p className="text-white font-medium">Mon - Sat: 8 AM - 10 PM</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-500 mb-1">Chat & Email</p>
                <p className="text-white font-medium">24/7 Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
