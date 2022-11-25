/** Formas de consumir uma API:
 * SPA (Single Page Application): 
  useEffect(() =>{
  fetch('http://localhost:3333/episodes')
  .then( response => response.json())
  .then( data => console.log(data));
})

* SSR (Server Side Rendering):
  (dentro de qualquer arquivo na pasta pages, e passando o props como parâmetro para o componente Home depois)

  export async function getServerSideProps(){
  const response = await fetch('http://localhost:3333/episodes');
  const data = await response.json();

  return {
    props: {
      episodes: data, 
  }
}

SSG (Server Side Generation): 
 export async function getStaticProps(){
  const response = await fetch('http://localhost:3333/episodes');
  const data = await response.json();

  return {
    props: {
      episodes: data, 
    },
    //revalidate recebe um n° em segundos de quanto em quanto tempo eu quero gerar uma nova versão da page
    revalidate: 60 * 60 * 8
  }
}
 */

import { GetStaticProps } from "next";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { format, parseISO } from "date-fns"; //parseISO pega uma data(string) e converte para um date
import ptBR from "date-fns/locale/pt-BR";

import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import { api } from "../services/api";
import { usePlayer } from "../contexts/PlayerContext";

import styles from "./Home.module.scss";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
};

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
};

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  //princípio da imutabilidade e spread operator
  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((unit, index) => {
            return (
              <li key={unit.id}>
                {/* image é um componente que precisa ser importado, ele é do próprio next e precisa
                estar nos arquivos de configuração next.config */}
                <Image
                  width={192}
                  height={192}
                  src={unit.thumbnail}
                  alt={unit.title}
                />

                {/* cada episódio */}
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${unit.id}`} legacyBehavior>
                    <a>{unit.title}</a>
                  </Link>
                  <p>{unit.members}</p>
                  <span>{unit.publishedAt}</span>
                  <span>{unit.durationAsString}</span>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
              <th className={styles.episodeSummary}></th>
            </tr>
          </thead>

          <tbody>
            {allEpisodes.map((unit, index) => {
              return (
                <tr key={unit.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={unit.thumbnail}
                      alt={unit.title}
                    />
                  </td>

                  <td>
                    <Link href={`/episodes/${unit.id}`} legacyBehavior>
                      <a>{unit.title}</a>
                    </Link>
                  </td>

                  <td> {unit.members} </td>
                  <td style={{ width: 100 }}> {unit.publishedAt} </td>
                  <td> {unit.durationAsString} </td>
                  <td>
                    {/**ou seja, o primeiro item vai começar após os 2 últimos lançamentos como index = 0 */}
                    <button
                      type="button"
                      onClick={() =>
                        playList(episodeList, index + latestEpisodes.length)
                      }
                    >
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

//consumindo API com SSG
export const getStaticProps: GetStaticProps = async () => {
  //limitando a quantidade de registros e a ordenação pela data de publição na ordem decrescente
  const response = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });
  const data = response.data;

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), "d MMM yy", {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2); //os primeiros últimos episódios
  const allEpisodes = episodes.slice(2, episodes.length); //o restante

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, //a cada 8h a página atualiza
  };
};
