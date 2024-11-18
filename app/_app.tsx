// pages/_app.tsx
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MelBal App</title>
        <meta
          name='description'
          content="Gestion Réservations Melkior - Bal'tazar"
        />
        <link
          rel='icon'
          href='/android/android-launchericon-192-192.png'
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
