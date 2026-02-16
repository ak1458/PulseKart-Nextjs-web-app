import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/ui/Chatbot";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ScrollToTop from "@/components/layout/ScrollToTop";
import HealthCheckWrapper from "@/components/layout/HealthCheckWrapper";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthMiddleware from "@/components/auth/AuthMiddleware";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin"],
});

const space = Space_Grotesk({
    variable: "--font-space",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PulseKart - Your Health, Delivered",
    description: "Pharmacy E-commerce store with verified medicines, fast delivery, and pharmacist support.",
    keywords: "pharmacy, medicines, health, online pharmacy, prescription drugs",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={`${jakarta.variable} ${space.variable} antialiased`}
                suppressHydrationWarning
            >
                <ReactQueryProvider>
                    <ErrorBoundary>
                        <AuthProvider>
                            <AuthMiddleware>
                                <CartProvider>
                                    <ScrollToTop />
                                    <Navbar />
                                    <main className="min-h-screen pt-[var(--site-top-offset)] pb-[var(--site-bottom-offset)]">
                                        {children}
                                    </main>
                                    <Chatbot />
                                    <MobileBottomNav />
                                    <Footer />
                                    <HealthCheckWrapper />
                                </CartProvider>
                            </AuthMiddleware>
                        </AuthProvider>
                    </ErrorBoundary>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
