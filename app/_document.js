import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='fr'>
      <Head>
        <title>MelBal App</title>
        <link
          rel='manifest'
          href='/manifest.json'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
