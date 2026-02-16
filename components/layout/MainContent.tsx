'use client';

import { usePathname } from 'next/navigation';

interface MainContentProps {
    children: React.ReactNode;
}

// Paths that don't need top padding (auth pages, admin pages)
const NO_TOP_PADDING_PATHS = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/admin',
];

export default function MainContent({ children }: MainContentProps) {
    const pathname = usePathname();
    
    const needsTopPadding = !NO_TOP_PADDING_PATHS.some(path => 
        pathname?.startsWith(path)
    );

    return (
        <main 
            className={`min-h-screen pb-[var(--site-bottom-offset)] ${
                needsTopPadding ? 'pt-[var(--site-top-offset)]' : ''
            }`}
        >
            {children}
        </main>
    );
}
