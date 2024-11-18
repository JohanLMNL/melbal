// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='fr'>
      <Head>
        <link
          rel='manifest'
          href='/manifest.json'
        />
        <link
          rel='icon'
          href='/android/android-lauchericon-192-192.png'
        />
        <meta
          name='theme-color'
          content='#09090B'
        />
        <meta
          name='description'
          content="Gestion Réservations Melkior - Bal'tazar"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
