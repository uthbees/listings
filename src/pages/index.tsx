import Head from 'next/head';
import Script from 'next/script';
import getPathToPublicFolder from '@/utils/getPathToPublicFolder';
import Listings from '@/components/Listings';
import { useState } from 'react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppConfig } from '@/types';

const queryClient = new QueryClient();

export default function App() {
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

    return (
        <>
            <Head>
                <title>Listings</title>
            </Head>
            <Script
                src={getPathToPublicFolder('config.js')}
                // @ts-expect-error - the exportedConfig variable is loaded from public/config.js
                onLoad={() => setAppConfig(exportedConfig)}
            />
            <QueryClientProvider client={queryClient}>
                {appConfig ? <Listings appConfig={appConfig} /> : null}
            </QueryClientProvider>
        </>
    );
}
