import "../styles/global.scss";
import { Header } from "../components/Header";
import { Player } from "../components/Player";
import styles from "../styles/app.module.scss";
import { PlayerContextProvider } from "../contexts/PlayerContext";

//o _app.tsx aqui no next funciona parecido com o routes do React
function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider>
      <div className={styles.appWrapper}>
        <main>
          <Header />
          {/*o componente Header estará presente em todas as telas do app*/}
          <Component {...pageProps} /> {/*o conteúdo da página*/}
        </main>
        <Player />
      </div>
    </PlayerContextProvider>
  );
}

export default MyApp;
