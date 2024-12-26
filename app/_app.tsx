import { AppProps } from 'next/app';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router'; // Importer useRouter pour accéder au router
import Head from 'next/head';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter(); // Récupérer le router

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

      {/* Conteneur principal */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={router.asPath} // Utilise le chemin de la route comme clé
          initial={{ opacity: 0, x: 100 }} // Part de la droite
          animate={{ opacity: 1, x: 0 }} // Arrive au centre
          exit={{ opacity: 0, x: -100 }} // Sort vers la gauche
          transition={{ duration: 0.5 }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default MyApp;
