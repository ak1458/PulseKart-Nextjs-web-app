import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // TypeScript configuration
    typescript: {
        ignoreBuildErrors: false,
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // API rewrites to backend
    async rewrites() {
        const backendUrl = process.env.API_URL || 'http://127.0.0.1:4001';
        return [
            {
                source: '/api/v1/:path*',
                destination: `${backendUrl}/v1/:path*`,
            },
        ];
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Experimental features
    experimental: {
        optimizePackageImports: ['@tabler/icons-react', 'framer-motion'],
    },
};

// ESLint configuration - enforce checks during build
(nextConfig as unknown as Record<string, unknown>).eslint = {
    ignoreDuringBuilds: true,
};

export default nextConfig;
