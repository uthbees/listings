import Head from 'next/head';
import Script from 'next/script';
import getPathToPublicFolder from '@/utils/getPathToPublicFolder';
import Listings from '@/components/Listings';
import { useState } from 'react';
import { PlaylistRequest } from '@/types';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
    const [playlistRequests, setPlaylistRequests] = useState<
        PlaylistRequest[] | null
    >(null);

    return (
        <>
            <Head>
                <title>Listings</title>
            </Head>
            <Script
                src={getPathToPublicFolder('config.js')}
                // @ts-expect-error - the playlists variable is loaded from public/config.js
                onLoad={() => setPlaylistRequests(playlists)}
            />
            <QueryClientProvider client={queryClient}>
                {playlistRequests ? (
                    <Listings playlistRequests={playlistRequests} />
                ) : null}
            </QueryClientProvider>
        </>
    );
}
