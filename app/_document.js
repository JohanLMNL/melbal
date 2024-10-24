import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='fr'>
      <Head>
        {/* Titre de la page */}
        <title>MelBal App</title>

        {/* Lien vers le manifest */}
        <link
          rel='manifest'
          href='/manifest.json'
        />

        {/* Icônes pour la PWA */}
        <link
          rel='icon'
          href='/android/android-launchericon-192-192.png'
        />
        <link
          rel='apple-touch-icon'
          href='/android/android-launchericon-512-512.png'
        />

        {/* Meta tags spécifiques à la PWA */}
        <meta
          name='theme-color'
          content='#000000'
        />
        <meta
          name='description'
          content='MelBal - Gestion des réservations'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
