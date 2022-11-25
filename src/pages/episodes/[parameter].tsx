//a ideia é fazer com que você possa acessar qualquer coisa depois de: http://localhost:3000/episode/
//então o parâmetro depois da barra entra como [parameter] aqui no arquivo
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import { GetStaticPaths, GetStaticProps } from "next";
import { api } from "../../services/api";

import styles from "./Episode.module.scss";
import { usePlayer } from "../../contexts/PlayerContext";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer(); //não é a função playList porque é para tocar 1 episódio só

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button className={styles.backHome} type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={600}
          height={120}
          src={episode.thumbnail}
          alt={episode.title}
          style={{marginTop: '1.5rem'}}
        />
       
          <button className={styles.playEpisode} type="button" onClick={()=> play(episode)}>
            <img src="/play.svg" alt="Tocar episódio" />
          </button>
     
      </div>

      <header>
        <h2>{episode.title}</h2>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

//método obrigatório em toda rota que utiliza geração estática e que tem parâmetros dinâmicos
export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sorte: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map((episode) => {
    return {
      params: {
        parameter: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  //precisa pegar esse parâmetro para buscar os dados, o id que vai ser usado para navegar
  //useRouter() não pode ser chamado aqui, pois é um hook e deve estar sempre dentro de um
  //componente, então usa-se um context, que pode chamar o params
  const { parameter } = context.params;
  const { data } = await api.get(`/episodes/${parameter}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
