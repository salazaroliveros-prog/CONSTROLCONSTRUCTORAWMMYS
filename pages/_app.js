import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log('SOFTCON-MYS: Service Worker registrado con éxito');
          },
          function (err) {
            console.log('SOFTCON-MYS: Fallo en el registro del SW', err);
          }
        );
      });
    }
  }, []);

  return <Component {...pageProps} />
}

export default MyApp
