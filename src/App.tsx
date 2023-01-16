import React from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import "App.css";
import "Queries.css";
import GameContextProvider from "context/GameContext";
import Game from "components/Game/Game.component";
import GameControls from "components/GameControls/GameControls.component";

const App: React.FC = () => {
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <GameContextProvider>
        <header className="game-title">Chess &mdash; Pass-N-Play</header>
        <main className="main">
          <Game />
          <GameControls />
        </main>
      </GameContextProvider>
    </DndProvider>
  );
};

export default App;
