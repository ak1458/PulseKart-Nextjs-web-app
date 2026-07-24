'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
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
} from '@/lib/icons';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/lib/images';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRICING_COPY } from '@/lib/constants';
import { safeNumber } from '@/lib/utils';
import {
    fetchQuote,
    placeOrder,
    uploadPrescription,
    isSignedIn,
    type OrderQuote,
} from '@/lib/checkout-api';

interface Address {
    id: number;
    type: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

type PaymentMethod = 'UPI' | 'CARD' | 'COD';

// Address Form Validation
const validateAddress = (address: Omit<Address, 'id' | 'isDefault'>): string[] => {
    const errors: string[] = [];

    if (!address.name || address.name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!address.phone || !/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
        errors.push('Phone must be 10 digits');
    }

    if (!address.address || address.address.length < 10) {
        errors.push('Address must be at least 10 characters');
    }

    if (!address.city || address.city.length < 2) {
        errors.push('City is required');
    }

    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
        errors.push('Pincode must be 6 digits');
    }

    return errors;
};

// Shopping Bag icon component for empty state
function ShoppingBag({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    );
}

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, clearCart } = useCart();

    // State
    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRxModal, setShowRxModal] = useState(false);
    const [offerCode, setOfferCode] = useState('');
    // The code that was actually applied, captured at apply time. Storing a
    // boolean meant editing the input afterwards kept the discount alive while
    // the code it came from no longer existed.
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [showOfferInput, setShowOfferInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Address State
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        type: 'Home'
    });
    const [addressErrors, setAddressErrors] = useState<string[]>([]);

    // Rx Upload State
    const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const isRxUploaded = prescriptionId !== null;

    // Server pricing
    const [quote, setQuote] = useState<OrderQuote | null>(null);
    const [isPricing, setIsPricing] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);

    // COD Modal State
    const [showCODModal, setShowCODModal] = useState(false);
    const [codModalDismissed, setCodModalDismissed] = useState(false);

    // Sync payment method with URL
    useEffect(() => {
        const method = searchParams.get('method');
        if (method && ['UPI', 'CARD', 'COD'].includes(method)) {
            setPaymentMethod(method as PaymentMethod);
        }
    }, [searchParams]);

    // Trigger COD Modal
    useEffect(() => {
        if (paymentMethod === 'COD' && !codModalDismissed) {
            const timer = setTimeout(() => setShowCODModal(true), 250);
            return () => clearTimeout(timer);
        }
    }, [paymentMethod, codModalDismissed]);

    // The line items the server needs in order to price the cart. It resolves
    // unit prices from the catalogue itself - deliberately not sent from here.
    const quoteItems = useMemo(
        () => cart.map(item => ({ productId: item.id, quantity: item.qty })),
        [cart],
    );

    // Server-authoritative pricing. Delivery thresholds, COD fees and discount
    // rules used to be duplicated in lib/constants.ts and recomputed in the
    // browser, which meant the customer's device decided what an order cost and
    // the two copies had already drifted. The page now renders what the API
    // returns and calculates none of it.
    useEffect(() => {
        if (cart.length === 0 || !isSignedIn()) return;

        let cancelled = false;
        setIsPricing(true);

        fetchQuote({
            items: quoteItems,
            paymentMethod,
            couponCode: appliedCode ?? undefined,
        })
            .then(result => {
                if (cancelled) return;
                setQuote(result);
                setQuoteError(null);
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setQuote(null);
                setQuoteError(err.message);
            })
            .finally(() => {
                if (!cancelled) setIsPricing(false);
            });

        return () => { cancelled = true; };
    }, [quoteItems, paymentMethod, appliedCode, cart.length]);

    const isOfferApplied = appliedCode !== null && quote?.couponCode === appliedCode;

    // Fall back to a bare item subtotal only for the pre-sign-in preview; the
    // authoritative figures always come from the quote.
    const safeCartTotal = useMemo(
        () => cart.reduce((acc, item) => acc + safeNumber(item.price, 0) * safeNumber(item.qty, 0), 0),
        [cart],
    );

    const subtotal = quote?.subtotal ?? safeCartTotal;
    const deliveryFee = quote?.deliveryFee ?? 0;
    const codFee = quote?.codFee ?? 0;
    const discount = quote?.discount ?? 0;
    const tax = quote?.tax ?? 0;
    const finalTotal = quote?.total ?? safeCartTotal;

    // Prescription status comes from the catalogue via the quote when we have
    // one, falling back to the flag carried on the cart item.
    const requiresPrescription = quote?.requiresPrescription
        ?? cart.some(item => item.requiresPrescription === true);

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAddressErrors([]);

        const errors = validateAddress(newAddress);
        if (errors.length > 0) {
            setAddressErrors(errors);
            return;
        }

        const address: Address = {
            id: savedAddresses.length + 1,
            ...newAddress,
            isDefault: false
        };
        setSavedAddresses([...savedAddresses, address]);
        setSelectedAddress(address.id);
        setShowAddressModal(false);
        setNewAddress({ name: '', phone: '', address: '', city: '', pincode: '', type: 'Home' });
    };

    const switchToUPI = () => {
        setPaymentMethod('UPI');
        setShowCODModal(false);
        setCodModalDismissed(true);
    };

    const continueWithCOD = () => {
        setShowCODModal(false);
        setCodModalDismissed(true);
    };

    const handlePayment = async () => {
        setError(null);

        if (step === 1) {
            setStep(2);
            return;
        }

        if (!isSignedIn()) {
            router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
            return;
        }

        // Re-derived from state rather than accepting a `bypassRx` argument
        // from the caller. The Rx modal's confirm button passed `true`, so the
        // gate's outcome depended on the call site being trustworthy - a
        // disabled attribute on a button is a UI hint, not an enforcement point.
        // The server enforces this independently in CheckoutService.
        if (requiresPrescription && !isRxUploaded) {
            setShowRxModal(true);
            return;
        }

        const address = savedAddresses.find(a => a.id === selectedAddress);
        if (!address) {
            setError('Please select a delivery address');
            return;
        }

        setIsProcessing(true);
        try {
            // Creates a real order: prices from the catalogue, validates the
            // coupon, enforces the prescription rule and decrements batch stock
            // in one transaction. This previously resolved a 2 second timer and
            // navigated to the confirmation page having persisted nothing.
            const order = await placeOrder({
                items: quoteItems,
                paymentMethod,
                couponCode: appliedCode ?? undefined,
                prescriptionId: prescriptionId ?? undefined,
                shippingAddress: { ...address },
            });

            clearCart();
            router.push(`/order-confirmation?orderId=${encodeURIComponent(order.id)}`);
        } catch (err) {
            // Surfaced rather than swallowed: an out-of-stock item or a coupon
            // that expired between pricing and submission must be visible.
            setError(err instanceof Error ? err.message : 'We could not place your order.');
            setIsProcessing(false);
        }
    };

    // Valid file types for prescription upload
    const VALID_PRESCRIPTION_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const validatePrescriptionFile = (file: File): string | null => {
        if (!file) return 'No file selected';
        if (!VALID_PRESCRIPTION_TYPES.includes(file.type)) {
            return 'Invalid file type. Please upload JPG, PNG, or PDF';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File too large. Maximum size is 5MB';
        }
        return null;
    };

    const handleRxUpload = async (file: File) => {
        if (isUploading || isRxUploaded || !file) return;
        
        // Validate file
        const validationError = validatePrescriptionFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!isSignedIn()) {
            router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // A real upload. This used to await a 1500ms timer and flip a
            // boolean - the file never left the browser, so no prescription was
            // ever retained against the order, which a pharmacy is required to
            // keep. The server re-validates type and size and checks the file's
            // magic number against its declared MIME type.
            const prescription = await uploadPrescription(file);
            setPrescriptionId(prescription.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload prescription.');
        } finally {
            setIsUploading(false);
        }
    };

    // Empty cart check
    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-20 md:pt-24 flex flex-col items-center justify-center px-4">
                <ShoppingBag className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                <button
                    onClick={() => router.push('/shop')}
                    className="mt-4 btn-gradient px-6 py-3 rounded-xl text-white font-bold"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 md:pt-24 md:pb-12 px-4">
            {/* Error Display */}
            {error && (
                <div className="max-w-3xl mx-auto px-4 mb-4">
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-sm hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Progress Steps */}
            <div className="max-w-3xl mx-auto px-4 mb-8">
                <div className="glass-panel rounded-2xl p-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10"></div>
                        <div
                            className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 -z-10 transition-all duration-500"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        ></div>

                        {['Cart', 'Address', 'Payment'].map((label, idx) => {
                            const stepNum = idx;
                            const isActive = step >= stepNum + 1;
                            const isCompleted = step > stepNum + 1;

                            return (
                                <div key={label} className="flex flex-col items-center px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-teal-500 to-emerald-500 border-teal-400 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 border-white/20 text-gray-500'}`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum + 1}
                                    </div>
                                    <span className={`text-xs font-bold mt-2 ${isActive ? 'text-teal-300' : 'text-gray-500'}`}>{label}</span>
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
                        <div className={`glass-panel p-6 rounded-2xl border transition-all ${step === 1 ? 'border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)]' : 'border-white/10'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                        <MapPin className="w-5 h-5 text-teal-300 icon-glow" />
                                    </div>
                                    Delivery Address
                                </h2>
                                {step === 2 && (
                                    <button onClick={() => setStep(1)} className="text-sm text-teal-300 font-bold hover:text-teal-200 transition-colors">Change</button>
                                )}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddress(addr.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${selectedAddress === addr.id ? 'border-teal-500/50 bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                            >
                                                {selectedAddress === addr.id && (
                                                    <div className="absolute top-3 right-3 text-teal-400">
                                                        <CheckCircle className="w-5 h-5 fill-current" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {addr.type === 'Home' ? <Home className="w-4 h-4 text-teal-300" /> : <Briefcase className="w-4 h-4 text-teal-300" />}
                                                    <span className="font-bold text-white">{addr.type}</span>
                                                </div>
                                                <p className="text-sm font-bold text-white">{addr.name}</p>
                                                <p className="text-sm text-gray-400 line-clamp-2">{addr.address}, {addr.city} - {addr.pincode}</p>
                                                <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone}</p>
                                            </div>
                                        ))}

                                        <div
                                            onClick={() => setShowAddressModal(true)}
                                            className="p-4 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-teal-500/50 hover:text-teal-300 hover:bg-teal-500/5 transition-all duration-300 min-h-[140px] group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-teal-500/20 transition-colors">
                                                <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
                                            </div>
                                            <span className="font-bold text-sm">Add New Address</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!selectedAddress) {
                                                setError('Please select or add a delivery address');
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                        className="w-full btn-gradient text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
                                    >
                                        Deliver Here
                                    </button>
                                </div>
                            )}

                            {step === 2 && selectedAddress && (
                                <div className="text-sm text-gray-300">
                                    <p className="font-bold text-white">{savedAddresses.find(a => a.id === selectedAddress)?.name}</p>
                                    <p className="text-gray-400">{savedAddresses.find(a => a.id === selectedAddress)?.address}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className={`glass-panel p-6 rounded-2xl border transition-all ${step === 2 ? 'border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)]' : 'border-white/10 opacity-50'} relative`}>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                    <CreditCard className="w-5 h-5 text-teal-300 icon-glow" />
                                </div>
                                Payment Method
                            </h2>

                            {step === 2 && (
                                <div className="space-y-4">
                                    <label className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'bg-teal-500/10 border border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'UPI'}
                                            onChange={() => setPaymentMethod('UPI')}
                                            className="mt-1 text-teal-500 focus:ring-teal-500 bg-transparent border-white/30"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-white">UPI (GPay, PhonePe, Paytm)</span>
                                                <div className="flex gap-2">
                                                    <img src="/images/payments/gpay.svg" className="h-5 w-auto" alt="GPay" />
                                                    <img src="/images/payments/upi.svg" className="h-5 w-auto" alt="UPI" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-emerald-300 font-bold bg-emerald-500/20 inline-block px-2 py-0.5 rounded border border-emerald-500/30">Fastest Confirmation ⚡</p>
                                            {paymentMethod === 'UPI' && (
                                                <p className="text-xs text-teal-300 font-bold mt-2 animate-pulse">You are saving {PRICING_COPY.UPI_DISCOUNT_PERCENT}% with UPI!</p>
                                            )}
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'bg-teal-500/10 border border-teal-500/50' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'CARD'}
                                            onChange={() => setPaymentMethod('CARD')}
                                            className="mt-1 text-teal-500 focus:ring-teal-500 bg-transparent border-white/30"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-white block">Credit / Debit Card</span>
                                            <p className="text-xs text-gray-400">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'bg-orange-500/10 border border-orange-500/50' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="mt-1 text-orange-500 focus:ring-orange-500 bg-transparent border-white/30"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-white block">Cash on Delivery</span>
                                            {paymentMethod === 'COD' && (
                                                <p className="text-xs text-orange-300 mt-1">Note: ₹{PRICING_COPY.COD_FEE_INR} Handling fee applies for COD orders.</p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 sticky top-[var(--sticky-offset)]">
                            <h3 className="font-bold text-white mb-4 text-lg">Order Summary</h3>

                            {/* Delivery ETA */}
                            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-emerald-300 icon-glow" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-300 font-bold">Estimated Delivery</p>
                                    <p className="text-sm font-bold text-white">Calculated at checkout</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center p-1 border border-white/10">
                                            <img src={getProductImage(item.image)} alt={item.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                                        </div>
                                        <span className="text-sm font-bold text-white whitespace-nowrap">₹{safeNumber(item.price * item.qty, 0)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Offer Code */}
                            <div className="mb-6 border-t border-white/10 pt-4">
                                <button
                                    onClick={() => setShowOfferInput(!showOfferInput)}
                                    className="flex items-center justify-between w-full text-sm font-bold text-teal-300 hover:text-teal-200"
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
                                                    onChange={(e) => {
                                                        setOfferCode(e.target.value.toUpperCase());
                                                        // Editing the code retracts the applied discount
                                                        // until Apply is pressed again.
                                                        setAppliedCode(null);
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent uppercase"
                                                />
                                                <button
                                                    onClick={() => {
                                                        // Object.hasOwn, not `in`: `in` walks the prototype
                                                        // chain, so "toString" and "constructor" were both
                                                        // accepted as valid coupon codes.
                                                        // The server decides whether a code is valid;
                                                        // re-quoting reflects the outcome. The old
                                                        // client-side list knew nothing about expiry,
                                                        // usage limits or minimum order value.
                                                        const code = offerCode.trim();
                                                        setAppliedCode(code.length > 0 ? code : null);
                                                    }}
                                                    className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {isOfferApplied && <p className="text-xs text-emerald-300 font-bold mt-2">Code Applied! You saved ₹{discount}</p>}
                                            {!isOfferApplied && offerCode && <p className="text-xs text-red-400 font-bold mt-2">Invalid or expired code</p>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Calculations */}
                            <div className="space-y-2 mb-6 border-t border-white/10 pt-4">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{safeCartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Delivery Fee</span>
                                    <span className={deliveryFee === 0 ? "text-emerald-300 font-bold" : "text-white"}>
                                        {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                                    </span>
                                </div>
                                {paymentMethod === 'COD' && (
                                    <div className="flex justify-between text-sm text-orange-300 font-medium">
                                        <span>COD Handling Fee</span>
                                        <span>+₹{codFee}</span>
                                    </div>
                                )}
                                {(isOfferApplied || paymentMethod === 'UPI') && discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-300 font-medium">
                                        <span>Discount {paymentMethod === 'UPI' ? '(UPI 5%)' : ''}</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-2 border-t border-white/10 mt-2">
                                    <span className="font-bold text-white text-lg">Total to Pay</span>
                                    <span className="font-bold text-white text-2xl text-teal-300">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Desktop Pay Button */}
                            <button
                                onClick={() => handlePayment()}
                                disabled={isProcessing || step === 1 || finalTotal <= 0}
                                className="w-full btn-gradient text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hidden md:flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>Processing <span className="animate-spin">⏳</span></>
                                ) : (
                                    <>Pay ₹{finalTotal.toFixed(2)} <ShieldCheck className="w-5 h-5" /></>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>100% Secure Payments by Razorpay</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <AlertCircle className="w-4 h-4 text-blue-400" />
                                    <span>Orders verified by certified pharmacists</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Pay Button */}
            <div className="fixed bottom-0 left-0 right-0 glass-dock p-4 md:hidden z-40 border-t border-white/10">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-gray-400 font-bold">Total</p>
                        <p className="text-xl font-bold text-white">₹{finalTotal.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => handlePayment()}
                        disabled={isProcessing || finalTotal <= 0}
                        className="flex-1 btn-gradient text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all"
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
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-purple-300"></div>

                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    animate={{ rotate: [0, -6, 6, -3, 3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4"
                                >
                                    <AlertCircle className="w-8 h-8" />
                                </motion.div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aww... COD has a ₹{PRICING_COPY.COD_FEE_INR} fee</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Handling cash costs extra. But wait! You can save <span className="font-bold text-green-600">{PRICING_COPY.UPI_DISCOUNT_PERCENT}% instantly</span> if you pay online.
                                </p>

                                <button
                                    onClick={switchToUPI}
                                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 mb-3 flex items-center justify-center gap-2 group"
                                >
                                    <span>Pay via UPI & Save {PRICING_COPY.UPI_DISCOUNT_PERCENT}%</span>
                                    <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    onClick={continueWithCOD}
                                    className="text-xs text-gray-400 font-medium hover:text-gray-600 hover:underline"
                                >
                                    I&apos;ll pay ₹{PRICING_COPY.COD_FEE_INR} extra, continue with COD
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Address</h3>

                            {/* Address Validation Errors */}
                            {addressErrors.length > 0 && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <ul className="text-sm text-red-600 list-disc list-inside">
                                        {addressErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newAddress.name}
                                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            pattern="\d{10}"
                                            maxLength={10}
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '') })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="10 digit number"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Address (House No, Street)</label>
                                    <textarea
                                        required
                                        value={newAddress.address}
                                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                        rows={2}
                                        placeholder="Complete address"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">City</label>
                                        <input
                                            required
                                            type="text"
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500">Pincode</label>
                                        <input
                                            required
                                            type="text"
                                            pattern="\d{6}"
                                            maxLength={6}
                                            value={newAddress.pincode}
                                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                            placeholder="6 digit pincode"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">Type</label>
                                    <div className="flex gap-4">
                                        {['Home', 'Work', 'Other'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    checked={newAddress.type === type}
                                                    onChange={() => setNewAddress({ ...newAddress, type })}
                                                    className="text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className="text-sm text-gray-700">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddressModal(false);
                                            setAddressErrors([]);
                                        }}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
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
                                            handleRxUpload(e.target.files[0]);
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
                                    onClick={() => { setShowRxModal(false); handlePayment(); }}
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading checkout...</p>
                </div>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}
