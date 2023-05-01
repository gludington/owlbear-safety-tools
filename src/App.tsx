import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import OBR, { Player } from "@owlbear-rodeo/sdk";
import { Overlay } from "./Overlay";
import { Menu } from "./Menu";

const ID = "com.github.gludington.owlbear-safety-tools";

type CardType = 'X' | 'N' | 'O';

export type status = {
  cardType: CardType,
  uuid: string, //to force metadata changes since we cannot pass modal close events
  pid?: string //an optional player id
}

export type Card = {
  id: CardType,
  name: string,
  image: string,
}

export type CardProvider = {
  name: string,
  url: string,
  cards: Card[]
}

type AppContext = {
  status: status | undefined;
  cards: CardProvider;
  player: Player | undefined;
  party: Player[];
}
export const statusKey = `${ID}/status`
export const modalKey = `${ID}/modal`

const AppContext = createContext<AppContext>({
  status: undefined,
  player: undefined,
  party: [],
  cards: {
    name: "",
    url: "",
    cards: []
  }
});
export const useApp = () => useContext(AppContext);

export function useCards() {
  const status = useRef<status | undefined>();
  const setStatus = useCallback((newStatus: status | undefined) => {
    if (newStatus === undefined) {
      if (status.current !== undefined) {
        OBR.modal.close(modalKey);
        status.current = undefined;
      }
    } else {
      if (status.current === undefined || status.current.uuid !== newStatus.uuid) {
        //console.info("Changing to/from", newStatus, status.current);
        status.current = newStatus;
        OBR.modal.open({
          id: modalKey,
          url: `/overlay/${status.current.cardType}`,
          width: 300,
          height: 420,
          fullScreen: false
        })
      }
    }
  }, [])


  const cards: CardProvider = useMemo(() => {
    return {
      name: 'RPGClinic',
      url: 'https://rpgclinic.com/safety/',
      cards: [{
        id: 'X',
        name: 'Pause',
        image: '/cards/rpgclinic/x.png'
      }, {
        id: 'N',
        name: 'Slow',
        image: '/cards/rpgclinic/n.png'
      }, {
        id: 'O',
        name: 'Continue',
        image: '/cards/rpgclinic/o.png'
      },
      ]
    };
  }, [])

  return {
    status: status.current,
    setStatus,
    cards
  }
}

const init = ({ setReady, setStatus, setParty, setPlayer }:
  { setReady: (ready: boolean) => void,
  setStatus: (status: status | undefined) => void,
  setParty: (party: Player[]) => void,
  setPlayer: (player: any) => void}) => {
  setReady(true);
    new Promise((resolve, reject) => {
      OBR.player.getId().then(id => resolve(id));
    }).then(id => {
      return new Promise((resolve, reject) => {
        OBR.player.getName().then(name => resolve({ id, name }));
      })
    }).then((p: any) => {
      return new Promise((resolve, reject) => {
        OBR.player.getRole().then(role => resolve({ ...p, role }))
      })
    }).then(p => setPlayer(p));
    OBR.player.onChange(player => {
      setPlayer(player);
    })
    OBR.party.getPlayers().then((players) => setParty(players));
    OBR.party.onChange((data) => {
      setParty(data);
    })
    OBR.room.getMetadata().then((meta) => {
      setStatus(meta[statusKey] as status)
    });
    OBR.room.onMetadataChange(function (meta) {
      if (meta[statusKey]) {
        setStatus(meta[statusKey] as status);
      } else {
        setStatus(undefined);
      }
    })
}
export const PluginGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = React.useState(false);
  const { status, cards, setStatus } = useCards();
  const [player, setPlayer] = useState<Player>();
  const [party, setParty] = useState<Player[]>([]);

  useEffect(() => {
    if (OBR.isAvailable) {
      if (OBR.isReady) {
        init({ setParty, setPlayer, setReady, setStatus });
      } else {
        OBR.onReady(() => init({ setParty, setPlayer, setReady, setStatus }));
      }
    }
  }, []);
  
  if (ready) {
    return <AppContext.Provider value={{cards, status, player, party} }>{children}</AppContext.Provider>;
  } else {
    return null;
  }
}


const router = createBrowserRouter(
  createRoutesFromElements(<>
    <Route path="/" element={<Menu />}/>
    <Route path="/overlay/:type" element={<Overlay/>} />
    </>
  )
)

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <PluginGate>
    <RouterProvider router={router} />
  </PluginGate>
);