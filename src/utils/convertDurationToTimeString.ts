export function convertDurationToTimeString(duration: number) {
  const hours = Math.floor(duration / 3600); // duração / 1h em segundos
  const min = Math.floor((duration % 3600) / 60); //retorna o n° de minutos restantes
  const seconds = duration % 60;

  // 00: 00: 00
  const finalTime = [hours, min, seconds]
    .map((time) => String(time).padStart(2, "0"))
    .join(":");

  return finalTime;
}
