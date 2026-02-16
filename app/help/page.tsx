import React from 'react';
import { Metadata } from 'next';
import { 
    Search, 
    Package, 
    Pill, 
    CreditCard, 
    Truck, 
    RefreshCw, 
    ShieldCheck,
    Phone,
    Mail,
    MessageCircle,
    ChevronRight,
    FileText,
    User,
    AlertCircle,
    Clock,
    MapPin,
    Heart,
    Stethoscope
} from '@/lib/icons';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Help Center & FAQs | PulseKart - Online Pharmacy Support',
    description: 'Find answers to frequently asked questions about ordering medicines, prescriptions, delivery, returns, and more. Get 24/7 support from PulseKart.',
    keywords: 'online pharmacy help, medicine delivery FAQ, prescription upload help, pharmacy support, medical questions, drug information, healthcare support',
    openGraph: {
        title: 'Help Center & FAQs | PulseKart',
        description: 'Get answers to all your pharmacy-related questions. 24/7 customer support available.',
        type: 'website',
    },
};

const HELP_CATEGORIES = [
    {
        id: 'orders',
        icon: Package,
        title: 'Orders & Delivery',
        description: 'Track orders, delivery times, shipping info',
        href: '#orders',
        color: 'blue'
    },
    {
        id: 'prescriptions',
        icon: Pill,
        title: 'Prescriptions',
        description: 'Upload Rx, prescription requirements, validity',
        href: '#prescriptions',
        color: 'emerald'
    },
    {
        id: 'payments',
        icon: CreditCard,
        title: 'Payments',
        description: 'Payment methods, refunds, billing issues',
        href: '#payments',
        color: 'purple'
    },
    {
        id: 'safety',
        icon: ShieldCheck,
        title: 'Product Safety',
        description: 'Authenticity, storage, expiration, quality',
        href: '#safety',
        color: 'orange'
    },
    {
        id: 'account',
        icon: User,
        title: 'Account & Profile',
        description: 'Manage account, addresses, preferences',
        href: '#account',
        color: 'pink'
    },
    {
        id: 'consultation',
        icon: Stethoscope,
        title: 'Health Consultation',
        description: 'Doctor consultations, medical advice',
        href: '#consultation',
        color: 'teal'
    },
];

const FAQ_SECTIONS = [
    {
        id: 'orders',
        icon: Package,
        title: 'Orders & Delivery',
        faqs: [
            {
                q: 'How do I track my order?',
                a: 'You can track your order in real-time through the "Orders" section in your account dashboard. Once your order is shipped, you\'ll receive an SMS and email with tracking details. You can also track via the delivery partner\'s app using the tracking ID provided.'
            },
            {
                q: 'What are the delivery charges?',
                a: 'Delivery is FREE for orders above ₹500. For orders below ₹500, a nominal delivery fee of ₹40 is charged. Express delivery (same-day) is available in select cities for an additional ₹99.'
            },
            {
                q: 'How long does delivery take?',
                a: 'Standard delivery takes 24-48 hours in metro cities and 2-4 days in other locations. Same-day express delivery is available for orders placed before 2 PM in select cities including Delhi, Mumbai, Bangalore, and Hyderabad.'
            },
            {
                q: 'Can I change my delivery address after placing an order?',
                a: 'Address changes are possible only within 30 minutes of placing the order. Please contact our customer support immediately at 1800-XXX-XXXX for assistance.'
            },
            {
                q: 'What if I\'m not available to receive the delivery?',
                a: 'Our delivery partner will attempt delivery up to 3 times. If unavailable, the order will be returned to our facility and a refund will be initiated within 5-7 business days.'
            },
            {
                q: 'Do you deliver to my location?',
                a: 'We deliver to 25,000+ pin codes across India. Enter your pin code on the product page or checkout to check delivery availability in your area.'
            }
        ]
    },
    {
        id: 'prescriptions',
        icon: Pill,
        title: 'Prescriptions',
        faqs: [
            {
                q: 'How do I upload a prescription?',
                a: 'You can upload your prescription in the "Upload Rx" section or during checkout. We accept clear photos or PDFs of physical prescriptions. Make sure the doctor\'s name, registration number, date, and medicines are clearly visible.'
            },
            {
                q: 'Is a prescription mandatory for all medicines?',
                a: 'Prescription is mandatory for Schedule H and H1 drugs (antibiotics, psychotropic medicines, etc.). Over-the-counter (OTC) medicines like vitamins, supplements, and basic pain relievers can be purchased without a prescription.'
            },
            {
                q: 'How long is my prescription valid?',
                a: 'Prescriptions are generally valid for 6 months from the date of issue unless specified otherwise by the doctor. For chronic conditions, we accept prescriptions up to 1 year old with doctor validation.'
            },
            {
                q: 'Can I use the same prescription for multiple orders?',
                a: 'Yes, you can use the same valid prescription for multiple orders within its validity period. The prescription is saved in your account for easy reordering.'
            },
            {
                q: 'What if my prescription is rejected?',
                a: 'Prescriptions may be rejected if they\'re blurry, expired, missing doctor details, or for restricted medicines. Our pharmacist will contact you within 2 hours with the reason and guide you on the next steps.'
            },
            {
                q: 'Can I consult a doctor through PulseKart?',
                a: 'Yes! We offer online doctor consultations for general health queries, prescription renewals, and minor ailments. Visit our "AI Health" section or "Consult a Doctor" page to book an appointment.'
            }
        ]
    },
    {
        id: 'payments',
        icon: CreditCard,
        title: 'Payments & Refunds',
        faqs: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking, Wallets, and Cash on Delivery (COD). We also offer EMI options on orders above ₹3,000.'
            },
            {
                q: 'Is Cash on Delivery available?',
                a: 'Yes, COD is available for orders up to ₹5,000. A nominal fee of ₹50 is charged for COD orders. Some prescription medicines may not be eligible for COD due to regulatory requirements.'
            },
            {
                q: 'How do refunds work?',
                a: 'Refunds are processed to the original payment method within 5-7 business days. For COD orders, refunds are processed via bank transfer or UPI. You can track refund status in your account dashboard.'
            },
            {
                q: 'My payment failed but money was deducted. What should I do?',
                a: 'Don\'t worry! Failed payments are automatically reversed within 3-5 business days. If not received, please contact our support with your transaction ID for immediate assistance.'
            },
            {
                q: 'Do you offer discounts or loyalty programs?',
                a: 'Yes! We offer first-time user discounts, seasonal sales, and a PulseKart Plus loyalty program where you earn points on every purchase that can be redeemed for discounts on future orders.'
            }
        ]
    },
    {
        id: 'safety',
        icon: ShieldCheck,
        title: 'Product Safety & Authenticity',
        faqs: [
            {
                q: 'Are your medicines genuine?',
                a: 'Absolutely! All medicines are sourced directly from authorized distributors and manufacturers. We maintain a cold chain for temperature-sensitive medicines and follow strict quality control protocols.'
            },
            {
                q: 'How do I check the expiry date?',
                a: 'All products display manufacturing and expiry dates on the product page. We guarantee a minimum shelf life of 3 months for medicines and 1 month for consumables from the date of delivery.'
            },
            {
                q: 'How are medicines stored and transported?',
                a: 'We maintain temperature-controlled storage facilities (2-8°C for cold storage medicines). Insulin, vaccines, and biologics are transported in specialized cold boxes with temperature monitoring.'
            },
            {
                q: 'What is your return policy for medicines?',
                a: 'Due to safety regulations, medicines cannot be returned once delivered unless damaged or expired. Wrong or damaged products can be returned within 7 days of delivery for a full refund.'
            },
            {
                q: 'Are generic medicines safe?',
                a: 'Yes! Generic medicines contain the same active ingredients as branded ones and are approved by the FDA/CDSCO. They are bioequivalent and much more affordable while maintaining the same quality standards.'
            }
        ]
    },
    {
        id: 'account',
        icon: User,
        title: 'Account Management',
        faqs: [
            {
                q: 'How do I create an account?',
                a: 'Click on "Sign In" and select "Create Account." Enter your mobile number, verify with OTP, and complete your profile. Having an account helps track orders, save prescriptions, and get personalized offers.'
            },
            {
                q: 'How do I update my delivery address?',
                a: 'Go to "My Account" → "Addresses" to add, edit, or delete delivery addresses. You can save multiple addresses (Home, Work, etc.) for faster checkout.'
            },
            {
                q: 'Is my personal information secure?',
                a: 'Yes! We use 256-bit SSL encryption for all data transmission. Your health information is protected under HIPAA guidelines and never shared with third parties without consent.'
            },
            {
                q: 'How do I delete my account?',
                a: 'To delete your account, go to Settings → Account → Delete Account. Note that this will permanently remove your order history and saved prescriptions. Active orders must be completed or cancelled first.'
            }
        ]
    },
    {
        id: 'consultation',
        icon: Stethoscope,
        title: 'Doctor Consultation',
        faqs: [
            {
                q: 'How does online consultation work?',
                a: 'Book a consultation through our app, describe your symptoms, and connect with a certified doctor via chat or video call. The doctor will diagnose and provide a digital prescription if needed.'
            },
            {
                q: 'Are the doctors certified?',
                a: 'Yes, all doctors on our platform are registered with the Medical Council of India (MCI) and have minimum 5 years of experience. Specialists are available for cardiology, dermatology, diabetes, and more.'
            },
            {
                q: 'What conditions can be treated online?',
                a: 'Online consultations are suitable for minor ailments, prescription renewals, lifestyle diseases, mental health counseling, and follow-ups. Emergency conditions require in-person hospital visits.'
            },
            {
                q: 'How much does a consultation cost?',
                a: 'General physician consultations start at ₹199. Specialist consultations range from ₹399-999. First-time users get 50% off their first consultation.'
            }
        ]
    }
];

export default function HelpPage() {
    return (
        <div className="min-h-screen pt-20 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        How can we <span className="text-teal-400">help you?</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Find answers to frequently asked questions about orders, prescriptions, 
                        payments, and more. Can&apos;t find what you&apos;re looking for? Contact our support team.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-white placeholder-gray-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Help Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                    {HELP_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                            emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                            orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                            pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
                            teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
                        };
                        
                        return (
                            <Link
                                key={category.id}
                                href={category.href}
                                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${colorClasses[category.color]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-white mb-1 group-hover:text-teal-300 transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-xs text-gray-400">{category.description}</p>
                            </Link>
                        );
                    })}
                </div>

                {/* FAQ Sections */}
                <div className="space-y-12">
                    {FAQ_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                        <Icon className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    {section.faqs.map((faq, idx) => (
                                        <div 
                                            key={idx}
                                            className="glass-panel rounded-2xl border border-white/10 overflow-hidden"
                                        >
                                            <details className="group">
                                                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                                    <span className="font-semibold text-white pr-4">{faq.q}</span>
                                                    <ChevronRight className="w-5 h-5 text-teal-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                                                </summary>
                                                <div className="px-5 pb-5 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                                                    {faq.a}
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Contact Section */}
                <section className="mt-16 glass-panel rounded-3xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
                        <p className="text-gray-400">Our support team is available 24/7 to assist you</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        <a 
                            href="tel:1800-XXX-XXXX"
                            className="flex items-center gap-4 p-5 glass-panel rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Phone className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Call Us</p>
                                <p className="text-sm text-gray-400">1800-XXX-XXXX</p>
                            </div>
                        </a>
                        
                        <a 
                            href="mailto:support@pulsekart.com"
                            className="flex items-center gap-4 p-5 glass-panel rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Email Us</p>
                                <p className="text-sm text-gray-400">support@pulsekart.com</p>
                            </div>
                        </a>
                        
                        <Link 
                            href="/health/chat"
                            className="flex items-center gap-4 p-5 glass-panel rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <MessageCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Live Chat</p>
                                <p className="text-sm text-gray-400">Chat with PulseBot</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* SEO Footer Content */}
                <footer className="mt-16 pt-8 border-t border-white/10">
                    <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-500">
                        <div>
                            <h3 className="font-semibold text-white mb-3">About PulseKart Help Center</h3>
                            <p className="leading-relaxed">
                                PulseKart is India&apos;s leading online pharmacy, delivering genuine medicines 
                                and healthcare products to your doorstep. Our help center provides comprehensive 
                                information about ordering medicines online, prescription requirements, delivery 
                                policies, and more. We are committed to making healthcare accessible and 
                                affordable for everyone.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-3">Popular Search Terms</h3>
                            <div className="flex flex-wrap gap-2">
                                {['online pharmacy', 'medicine delivery', 'prescription upload', 
                                  'generic medicines', 'doctor consultation', 'health checkup',
                                  'diabetes care', 'heart care', 'baby care products'].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 text-xs mt-8">
                        © 2026 PulseKart India Pvt Ltd. All rights reserved. | 
                        Licensed Pharmacy: IND/PHARMA/2026/PK001
                    </p>
                </footer>
            </div>
        </div>
    );
}
