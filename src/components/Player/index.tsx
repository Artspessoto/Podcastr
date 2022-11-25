import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./styles.module.scss";

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null); //se trata de criar referências para ler elementos html
  const [progress, setProgress] = useState(0); //é o progresso do áudio do podcast

  //atribuição via desestruturação com a lista de ep, index do episódio tocado e se está tocando ou não
  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState 
  } = usePlayer();

  //quando o isPlaying for mudado, tem que haver mudança no seu estado
  // então o useEffect vai disparar sempre que o isPlaying for alterado
  useEffect(() => {
    //current == valor da referência
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

  //progresso do player
  function setupProgressListener() {
    //sempre que for mudado de um áudio para outro, começar em 0 novamente
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener("timeupdate", () => {
      setProgress(Math.floor(audioRef.current.currentTime)); //vai retonar o tempo atual do player
    });
  }

  function handleSeek(amountDuration: number) {
    audioRef.current.currentTime = amountDuration; //ele vai alterar só no áudio e não no progresso, então:
    setProgress(amountDuration); //porque mantém dentro da var progress o quanto ela percorreu
  }

  //quando acabar o áudio, ele ir para o próximo:
  function handleEpisodeEnded(){
    if(hasNext) playNext(); //ir para o próximo som
    else clearPlayerState(); //limpar o player caso acabar a lista
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="tocando" />
        <strong>Tocando agora</strong>
      </header>

      {/**fazendo uma condicional para caso tenha o episódio ou não */}
      {episode ? (
        //se tiver o episódio:
        <div className={styles.currentEpisode}>
          <Image
            width={250}
            height={200}
            src={episode.thumbnail}
            alt={episode.title}
            style={{ objectFit: "cover" }}
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        //caso não tenha:
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      {/** a classe empty só é chamada caso não houver episódio    */}
      <footer className={!episode ? styles.empty : ""}>
        {/** barra de progresso do podcast */}
        <div className={styles.episodeName_SmallScreen}>
          {episode && (<strong>{episode.title}</strong>)}
        </div>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              //caso houver o episódio em tela, a barra de progresso muda
              <Slider
                max={episode.duration} //duração máxima desse Slider, que é o número de segundos do ep
                value={progress} // e o valor vai ser progress, o tanto que o ep progrediu
                onChange={handleSeek} //que é quando o user vai "arrastar" o slider
                trackStyle={{ backgroundColor: "#04d361" }}
                railStyle={{ backgroundColor: "#9f75ff" }}
                handleStyle={{ borderColor: "#04d361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          {/**contúdo, o episódio pode estar nulo, pois se não tiver música tocando no ep ele vai
           * estar vazio, então faz a verificação -> episode?, pois se ele não existir, não acessa a duration,
           * e se não tiver o valor do episode.duration, aplica-se o value 0
           */}
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {/*caso houver o episódio, ele reproduz o áudio, (um if sem else), só que agora precisa ter um pause,
        então, cria-se um boolean para caso estiver tocando*/}
        {episode && (
          <audio
          src={episode.url}
          ref={audioRef}
          loop={isLooping}
          autoPlay
          onEnded={handleEpisodeEnded} //função que é executada quando o áudio chega no final
          onPlay={() => setPlayingState(true)}
          onPause={()=> setPlayingState(false)}
          onLoadedMetadata={setupProgressListener}
        />
        )}

        <div className={styles.buttons}>
          {/**caso não houver um episódio tocando, tira as opções de play, randomizar, voltar, pular e etc
           * obs: o disable serve para prevenir o click
           */}
          <button
            type="button"
            disabled={!episode || episodeList.length == 1} //não faz sentido embaralhar se tiver um único ep
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            <img src="/shuffle.svg" alt="embaralhar" />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            disabled={!episode || !hasPrevious}
          >
            <img src="/play-previous.svg" alt="voltar" />
          </button>

          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="tocar" />
            ) : (
              <img src="/play.svg" alt="tocar" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            disabled={!episode || !hasNext}
          >
            <img src="/play-next.svg" alt="pular" />
          </button>

          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="/repeat.svg" alt="repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
