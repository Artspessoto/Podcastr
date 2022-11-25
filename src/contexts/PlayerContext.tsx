import { createContext, useState, ReactNode, useContext } from "react";

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

type PlayerContextData = {
  episodeList: Episode[]; //pois é uma lista de episódios, por conta de poder pular o ep ou voltar
  currentEpisodeIndex: number; // índice do episódio que está tocando, apontando para a lista Episode[]
  isPlaying: boolean; //um controlador para saber se o episódio está tocando ou não
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void; //função do app
  playList: (list: Episode[], index: number) => void; //para ouvir a lista de episódios
  playNext: () => void; //pula o episódio
  playPrevious: () => void; //volta um episódio
  togglePlay: () => void; //trocar entre as imgs play e pause
  toggleLoop: () => void; //tocar novamente
  toggleShuffle: () => void; //randomizar o episódio, ser aleatório
  setPlayingState: (state: boolean) => void;
  hasNext: boolean; // controlador usado pelo playNext
  hasPrevious: boolean; // controlador usado pelo playPrevious
  clearPlayerState: () => void; //limpar o player
};

//o createContext é o tipo de valor que vai ser passado, o valor dos dados
export const PlayerContext = createContext({} as PlayerContextData);

type PlayerContextProviderProps = {
  //o ReactNode é um string, number, boolean, elemento react,jsx, etc. E nesse caso o children também
  //pode ter qualquer elemento dentro dele tipado
  children: ReactNode;
};

export function PlayerContextProvider({
  children,
}: PlayerContextProviderProps) {
  //mudanças de estado na UI, onde essa lista de episódios é um array e o episódio atual(que é iniciado com 0)
  // é um number já pré definido no typeScript
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  //função para manipular o valor das variáveis
  function play(episode: Episode) {
    //a função recebe um episódio e "coloca" dentro da setEpisodeList e vai ser passada para o Context
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsPlaying(true); //para mudar o estado e o botão para pause quando estiver tocando
  }

  //recebe como parâmetro uma lista de episódios e um índice do episódio que é pra tocar
  function playList(list: Episode[], index: number) {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true); //porque se o usuário tiver pausado manualmente o player e ele quiser tocar outro ep
    //o episódio tem que começar a tocar
  }

  //se estiver pausado, ele toca, e se estiver tocando ele pausa (uma função de mudança de estado)
  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  function toggleLoop() {
    setIsLooping(!isLooping);
  }

  function toggleShuffle() {
    setIsShuffling(!isShuffling);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  //limpar o player para o caso de terminar o áudio
  function clearPlayerState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || currentEpisodeIndex + 1 < episodeList.length;

  //que vai pro próximo episódio
  function playNext() {
    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(
        Math.random() * episodeList.length
      );
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    } else if (hasNext) {
      //vai capturar o index do episódio atual e acrescentar + 1
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }

  function playPrevious() {
    if (hasPrevious) setCurrentEpisodeIndex(currentEpisodeIndex - 1);
  }

  return (
    //o value é obrigatório para o Provider, e nesse momento, todos os componentes dentro do Provider
    //tem acesso ao value passado
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        play,
        playList,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        isPlaying,
        isLooping,
        isShuffling,
        setPlayingState,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        clearPlayerState,
      }}
    >
      {/**isso vai repassar todo o conteúdo que possui dentro do PlayerContext.Provider do _app.tsx
       * para dentro da tag
       */}
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
};
