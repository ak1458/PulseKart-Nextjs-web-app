import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/ui/Chatbot";
import { CartProvider } from "@/context/CartContext";
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
  title: "Pulse Kart Starter",
  description: "Pharmacy E-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${jakarta.variable} ${space.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Chatbot />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
