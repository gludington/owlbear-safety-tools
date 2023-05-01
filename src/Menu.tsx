import OBR from '@owlbear-rodeo/sdk';
import { v4 as uuid } from 'uuid'
import { status, statusKey, useApp, useCards, usePlayers } from './App';

const show = async (status: status) => {  
  const pid = await OBR.player.getId();
  OBR.room.setMetadata({ [`${statusKey}`]:status });
}

const Card = ({ card }:{card: any}) => {
  return (
    <div onClick={(e) => show({ cardType: card.id, uuid: uuid() })}>
      <img src={card.image} width="53" height="75" /><br />
          {card.name}
    </div>
  )
}
export const Menu = () => {
  const { cards, player} = useApp();
  return (
    <div style={{ paddingLeft: "15px", paddingRight: "15px", paddingTop: "15px", color: "white"}}>
    <div style={{ display: "flex", gap: "30px", justifyContent: "between" }}>
      {cards.cards.map(card => <Card key={card.id} card={card} />)}
    </div>
      <h3>Safety Tools by <a style={{ color: "white" }} href={cards.url} target="_blank">{cards.name}</a></h3>
      {player?.role === 'GM' ? "Provider change TBD" : null}
    </div>
    )
}