/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

// noinspection JSUnusedGlobalSymbols
module.exports = {
    reactStrictMode: true,
    images: { unoptimized: true },
    output: 'export',
    distDir: 'listingsBuild',
    assetPrefix: isProd ? '.' : undefined,
    webpack: (config) => {
        const fallback = config.resolve.fallback || {};
        Object.assign(fallback, {
            fs: false,
        });
        return config;
    },
};
