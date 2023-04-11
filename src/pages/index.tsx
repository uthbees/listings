import Head from 'next/head';
import Script from 'next/script';
import getPathToPublicFolder from '@/utils/getPathToPublicFolder';
import Listings from '@/components/Listings';
import { useState } from 'react';
import { Playlist } from '@/types';

export default function App() {
    const [configPlaylists, setConfigPlaylists] = useState<Playlist[] | null>(
        null,
    );

    return (
        <>
            <Head>
                <title>Listings</title>
            </Head>
            <Script
                src={getPathToPublicFolder('config.js')}
                // @ts-expect-error - the playlists variable is loaded from public/config.js
                onLoad={() => setConfigPlaylists(playlists)}
            />
            {configPlaylists ? <Listings playlists={configPlaylists} /> : null}
        </>
    );
}
