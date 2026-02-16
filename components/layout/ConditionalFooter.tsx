'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// Paths that should NOT show footer
const HIDE_FOOTER_PATHS = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/admin',
];

export default function ConditionalFooter() {
    const pathname = usePathname();
    
    const shouldShowFooter = !HIDE_FOOTER_PATHS.some(path => 
        pathname?.startsWith(path)
    );

    if (!shouldShowFooter) return null;
    
    return <Footer />;
}
