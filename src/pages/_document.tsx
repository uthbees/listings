import { Html, Head, Main, NextScript } from 'next/document';
import getPathToPublicFolder from '@/utils/getPathToPublicFolder';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href={getPathToPublicFolder('favicon.svg')} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
