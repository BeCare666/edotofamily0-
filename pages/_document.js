import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="fr">
            <Head>
                {/* Fonts Google correctement placées ici **/}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                { /*link for logo or favicon*/}
                <link rel="icon" href="/logo/favicon.png" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body className="bg-slate-50 text-slate-800 antialiased selection:bg-pink-200 selection:text-pink-900">

                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
