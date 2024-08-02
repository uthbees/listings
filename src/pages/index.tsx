import Head from 'next/head';
import Script from 'next/script';
import getPathToPublicFolder from '@/functions/getPathToPublicFolder';
import Listings from '@/components/Listings';
import { useState } from 'react';

import { AppConfig } from '@/types/appConfig';

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
            {appConfig ? <Listings appConfig={appConfig} /> : null}
        </>
    );
}
