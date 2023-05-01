import { useParams } from "react-router-dom";
import { useApp, useCards, usePlayers } from "./App";
import { useEffect, useMemo, useState } from "react";

const CardOverlay = ({ card }: { card: any }) => {
  
  return (
    <div className="box">
    <h2>{card.name}</h2>
      <div><img alt={card.name} src={card.image} /></div>
    </div>
  )  
}

export const Overlay = () => {
  const { type } = useParams();
  const { cards } = useApp();
  const card = useMemo(() => {
    if (type && cards?.cards) {
      return cards.cards.find(card => card.id === type)
    }
    return undefined;
  }, [type, cards])
    return (
      <div>
        {card ? <CardOverlay card={card} /> : null}
      </div>
    )
  }
