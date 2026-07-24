import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // `pg` is a native-ish driver; keep it out of the bundler so it loads at
    // runtime in server components and route handlers.
    serverExternalPackages: ['pg', 'bcryptjs'],
};

export default nextConfig;
