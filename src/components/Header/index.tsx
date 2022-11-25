import styles from './styles.module.scss';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

export function Header(){
     // MMMM = retorna o mês completo, d == retorna o dia exato e EEEEEE == o dia da semana abreviado
     //https://date-fns.org/v2.29.3/docs/format 
    const currentDate = format(new Date(), 'EEEEEE, d MMMM', {
        locale: ptBR,
    })
    
    return(
        <header className={styles.headerContainer}> 
            <img src="/logo.svg" alt="Podcastr" />

            <p>O melhor para você ouvir, sempre</p>

            <span>{currentDate}</span>
        </header>
    )
}