import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MelBal App',
  description: "Gestion Réservations Melkior - Bal'tazar",
  icons: {
    icon: '/android/android-launchericon-192-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang='fr'>
      <head>
        <link
          rel='manifest'
          href='/manifest.json'
        />
        <link
          rel='apple-touch-icon'
          href='/ios/100.png'
        />
      </head>
      <body className='dark bg-zinc-950 text-zinc-50'>
        {children}
      </body>
    </html>
  );
}
