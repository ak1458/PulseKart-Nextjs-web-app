'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    CreditCard,
    Truck,
    MapPin,
    Home,
    Briefcase,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Zap,
    Upload,
    Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock Saved Addresses
const SAVED_ADDRESSES = [
    {
        id: 1,
        type: 'Home',
        name: 'Ashraf Khan',
        phone: '9876543210',
        address: '123, Green Valley Apts, Vasant Vihar',
        city: 'New Delhi',
        pincode: '110057',
        isDefault: true
    },
    {
        id: 2,
        type: 'Office',
        name: 'Ashraf Khan',
        phone: '9876543210',
        address: 'Tech Park, Sector 62',
        city: 'Noida',
        pincode: '201301',
        isDefault: false
    }
];

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, cartTotal } = useCart();

    // State
    const [step, setStep] = useState(1); // 1: Address, 2: Payment
    const [selectedAddress, setSelectedAddress] = useState<number | null>(1);
    const [paymentMethod, setPaymentMethod] = useState(searchParams.get('method') || 'UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRxModal, setShowRxModal] = useState(false);
    const [offerCode, setOfferCode] = useState('');
    const [isOfferApplied, setIsOfferApplied] = useState(false);
    const [showOfferInput, setShowOfferInput] = useState(false);

    // Rx Upload State
    const [isRxUploaded, setIsRxUploaded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // COD Modal State
    const [showCODModal, setShowCODModal] = useState(false);
    const [codModalDismissed, setCodModalDismissed] = useState(false);

    // Trigger COD Modal
    useEffect(() => {
        if (paymentMethod === 'COD' && !codModalDismissed) {
            const timer = setTimeout(() => setShowCODModal(true), 250);
            return () => clearTimeout(timer);
        }
    }, [paymentMethod, codModalDismissed]);

    const switchToUPI = () => {
        setPaymentMethod('UPI');
        setShowCODModal(false);
        setCodModalDismissed(true);
    };

    const continueWithCOD = () => {
        setShowCODModal(false);
        setCodModalDismissed(true);
    };

    // Fix NaN Error: Calculate total locally if context fails
    const safeCartTotal = cartTotal || cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const deliveryFee = safeCartTotal > 500 ? 0 : 40;
    const codFee = paymentMethod === 'COD' ? 50 : 0;
    const discount = isOfferApplied ? Math.round(safeCartTotal * 0.10) : (paymentMethod === 'UPI' ? Math.round(safeCartTotal * 0.05) : 0);
    const finalTotal = safeCartTotal + deliveryFee + codFee - discount;

    // Mock Rx Requirement
    const requiresPrescription = cart.some(item => item.name.toLowerCase().includes('tablet') || item.name.toLowerCase().includes('syrup'));

    const handlePayment = (bypassRx = false) => {
        // If Rx is required and NOT uploaded (and not bypassed), show modal
        if (requiresPrescription && !isRxUploaded && !bypassRx) {
            setShowRxModal(true);
            return;
        }

        setIsProcessing(true);
        // Mock Payment Delay
        setTimeout(() => {
            setIsProcessing(false);
            router.push('/order-confirmation');
        }, 2000);
    };

    const handleRxUpload = () => {
        if (isUploading || isRxUploaded) return;
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setIsRxUploaded(true);
            setIsUploading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between relative">
                        {/* Line */}
                        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                        <div
                            className={`absolute left-0 top-1/2 h-0.5 bg-teal-500 -z-10 transition-all duration-500`}
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        ></div>

                        {/* Steps */}
                        {['Cart', 'Address', 'Payment'].map((label, idx) => {
                            const stepNum = idx; // 0, 1, 2
                            const isActive = step >= stepNum + 1;
                            const isCompleted = step > stepNum + 1;

                            return (
                                <div key={label} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${isActive ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum + 1}
                                    </div>
                                    <span className={`text-xs font-medium mt-1 ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Address Section */}
                        <div className={`bg-white p-6 rounded-2xl border ${step === 1 ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200'} shadow-sm transition-all`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-teal-600" /> Delivery Address
                                </h2>
                                {step === 2 && (
                                    <button onClick={() => setStep(1)} className="text-sm text-teal-600 font-bold hover:underline">Change</button>
                                )}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6">
                                    {/* Saved Addresses */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {SAVED_ADDRESSES.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddress(addr.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${selectedAddress === addr.id ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'
                                                    }`}
                                            >
                                                {selectedAddress === addr.id && (
                                                    <div className="absolute top-3 right-3 text-teal-600">
                                                        <CheckCircle className="w-5 h-5 fill-current" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {addr.type === 'Home' ? <Home className="w-4 h-4 text-gray-500" /> : <Briefcase className="w-4 h-4 text-gray-500" />}
                                                    <span className="font-bold text-gray-900">{addr.type}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{addr.name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-2">{addr.address}, {addr.city} - {addr.pincode}</p>
                                                <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>
                                            </div>
                                        ))}

                                        {/* Add New Address Button */}
                                        <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-teal-500 hover:text-teal-600 transition-colors min-h-[140px]">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                                                <span className="text-2xl">+</span>
                                            </div>
                                            <span className="font-bold text-sm">Add New Address</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition-all active:scale-95"
                                    >
                                        Deliver Here
                                    </button>
                                </div>
                            )}

                            {step === 2 && selectedAddress && (
                                <div className="text-sm text-gray-600">
                                    <p className="font-bold text-gray-900">{SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.name}</p>
                                    <p>{SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.address}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className={`bg-white p-6 rounded-2xl border ${step === 2 ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200'} shadow-sm transition-all opacity-${step === 2 ? '100' : '50'} relative`}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-teal-600" /> Payment Method
                            </h2>

                            {step === 2 && (
                                <div className="space-y-4">
                                    {/* UPI */}
                                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'UPI'}
                                            onChange={() => setPaymentMethod('UPI')}
                                            className="mt-1 text-teal-600 focus:ring-teal-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-gray-900">UPI (GPay, PhonePe, Paytm)</span>
                                                <div className="flex gap-2">
                                                    <img src="https://cdn.iconscout.com/icon/free/png-256/free-google-pay-logo-icon-download-in-svg-png-gif-file-formats--payment-provider-brand-logos-icons-1399869.png" className="h-5 w-auto" alt="GPay" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" className="h-5 w-auto" alt="UPI" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-green-700 font-bold bg-green-100 inline-block px-2 py-0.5 rounded">Fastest Confirmation ⚡</p>
                                            {paymentMethod === 'UPI' && (
                                                <p className="text-xs text-teal-600 font-bold mt-1 animate-pulse">🎉 You are saving 5% with UPI!</p>
                                            )}
                                        </div>
                                    </label>

                                    {/* Card */}
                                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={() => setPaymentMethod('CARD')}
                                            className="mt-1 text-teal-600 focus:ring-teal-500"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-900 block">Credit / Debit Card</span>
                                            <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </label>

                                    {/* COD */}
                                    <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="mt-1 text-teal-600 focus:ring-teal-500"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-900 block">Cash on Delivery</span>
                                            {paymentMethod === 'COD' && (
                                                <p className="text-xs text-red-500 mt-1">Note: ₹50 Handling fee applies for COD orders.</p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

                            {/* Delivery ETA */}
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-6 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-green-800 font-bold">Estimated Delivery</p>
                                    <p className="text-sm font-bold text-gray-900">Today by 7:00 PM</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1 border border-gray-100">
                                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Offer Code */}
                            <div className="mb-6 border-t border-gray-100 pt-4">
                                <button
                                    onClick={() => setShowOfferInput(!showOfferInput)}
                                    className="flex items-center justify-between w-full text-sm font-bold text-teal-600 hover:text-teal-700"
                                >
                                    <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Have a promo code?</span>
                                    {showOfferInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <AnimatePresence>
                                    {showOfferInput && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mt-3"
                                        >
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter code"
                                                    value={offerCode}
                                                    onChange={(e) => setOfferCode(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                />
                                                <button
                                                    onClick={() => setIsOfferApplied(true)}
                                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {isOfferApplied && <p className="text-xs text-green-600 font-bold mt-2">Code Applied! You saved ₹{discount}</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Calculations */}
                            <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{safeCartTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                                        {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                {paymentMethod === 'COD' && (
                                    <div className="flex justify-between text-sm text-red-500 font-medium">
                                        <span>COD Handling Fee</span>
                                        <span>+₹{codFee}</span>
                                    </div>
                                )}
                                {(isOfferApplied || paymentMethod === 'UPI') && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Discount {paymentMethod === 'UPI' ? '(UPI 5%)' : ''}</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                    <span>Total to Pay</span>
                                    <span>₹{finalTotal}</span>
                                </div>
                            </div>

                            {/* Desktop Pay Button */}
                            <button
                                onClick={() => handlePayment()}
                                disabled={isProcessing || step === 1}
                                className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-teal-200/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>Processing <span className="animate-spin">⏳</span></>
                                ) : (
                                    <>Pay ₹{finalTotal} <ShieldCheck className="w-5 h-5" /></>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span>100% Secure Payments by Razorpay</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                    <span>Orders verified by certified pharmacists</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Pay Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-bold">Total</p>
                        <p className="text-xl font-bold text-gray-900">₹{finalTotal}</p>
                    </div>
                    <button
                        onClick={step === 1 ? () => setStep(2) : () => handlePayment()}
                        disabled={isProcessing}
                        className="flex-1 bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {step === 1 ? 'Proceed to Pay' : (isProcessing ? 'Processing...' : 'Pay Now')}
                    </button>
                </div>
            </div>

            {/* COD Discouragement Modal */}
            <AnimatePresence>
                {showCODModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 relative overflow-hidden"
                        >
                            {/* Cute background decoration */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-purple-300"></div>

                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="text-5xl mb-4"
                                >
                                    😢
                                </motion.div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aww... COD has a ₹50 fee</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Handling cash costs extra. But wait! You can save <span className="font-bold text-green-600">5% instantly</span> if you pay online.
                                </p>

                                <button
                                    onClick={switchToUPI}
                                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 mb-3 flex items-center justify-center gap-2 group"
                                >
                                    <span>Pay via UPI & Save 5%</span>
                                    <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    onClick={continueWithCOD}
                                    className="text-xs text-gray-400 font-medium hover:text-gray-600 hover:underline"
                                >
                                    I'll pay ₹50 extra, continue with COD
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rx Upload Modal */}
            <AnimatePresence>
                {showRxModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Upload className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Prescription Required</h3>
                            <p className="text-gray-500 text-center mb-6 text-sm">
                                Some items in your cart require a valid prescription. Please upload it to continue.
                            </p>

                            <label
                                className={`border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center transition-colors cursor-pointer bg-gray-50 ${isRxUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-teal-500 hover:text-teal-500 text-gray-400'} ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleRxUpload();
                                        }
                                    }}
                                    disabled={isUploading || isRxUploaded}
                                />
                                {isRxUploaded ? (
                                    <>
                                        <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                                        <span className="text-xs font-bold text-green-600">Prescription Uploaded!</span>
                                    </>
                                ) : isUploading ? (
                                    <>
                                        <div className="w-8 h-8 mb-2 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold text-teal-600">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-bold">Click to Upload</span>
                                    </>
                                )}
                            </label>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setShowRxModal(false); handlePayment(true); }}
                                    disabled={!isRxUploaded || isUploading}
                                    className={`w-full py-3 font-bold rounded-xl transition-colors ${isRxUploaded ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {isRxUploaded ? 'Proceed to Payment' : (isUploading ? 'Uploading...' : 'Upload Required')}
                                </button>
                                <button
                                    onClick={() => setShowRxModal(false)}
                                    className="w-full py-3 text-gray-500 font-bold hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
