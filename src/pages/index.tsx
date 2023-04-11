import Head from 'next/head';
import Script from 'next/script';
import getPathToPublicFolder from '@/utils/getPathToPublicFolder';
import Listings from '@/components/Listings';
import { useState } from 'react';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { MediaRequests } from '@/types';

const queryClient = new QueryClient();

export default function App() {
    const [mediaRequests, setMediaRequests] = useState<MediaRequests | null>(
        null,
    );

    return (
        <>
            <Head>
                <title>Listings</title>
            </Head>
            <Script
                src={getPathToPublicFolder('config.js')}
                // @ts-expect-error - the requests variable is loaded from public/config.js
                onLoad={() => setMediaRequests(requests)}
            />
            <QueryClientProvider client={queryClient}>
                {mediaRequests ? (
                    <Listings mediaRequests={mediaRequests} />
                ) : null}
            </QueryClientProvider>
        </>
    );
}
