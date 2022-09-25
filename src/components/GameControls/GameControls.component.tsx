import React, { useState, useContext } from "react";
import {
  LightBulbIcon,
  RefreshIcon,
  ArrowSmLeftIcon,
  ArrowSmRightIcon,
} from "@heroicons/react/outline";
import { LightBulbIcon as SolidLightBulbIcon } from "@heroicons/react/solid";

import "./GameControls.css";
import { GameContext } from "context/GameContext";
import ControlButton from "components/UI/Button/ControlButton.component";
import RestartGame from "components/RestartGame/RestartGame.component";

const GameControls: React.FC = () => {
  const { highlighted, togglePossibleMoves, restartGame, goBackHistory, goForwardHistory } =
    useContext(GameContext);

  const [showRestart, setShowRestart] = useState(false);

  const onShowRestartGameClickHandler = () => {
    setShowRestart(true);
  };

  const onRestartGameClickHandler = () => {
    restartGame();
    setShowRestart(false);
  };

  const onCancelRestartGameClickHandler = () => {
    setShowRestart(false);
  };

  return (
    <>
      <div className="game-controls">
        <ControlButton onClickHandler={togglePossibleMoves}>
          {highlighted.show ? <SolidLightBulbIcon /> : <LightBulbIcon />}
        </ControlButton>
        <ControlButton onClickHandler={onShowRestartGameClickHandler}>
          <RefreshIcon />
        </ControlButton>
        <ControlButton onClickHandler={goBackHistory}>
          <ArrowSmLeftIcon />
        </ControlButton>
        <ControlButton onClickHandler={goForwardHistory}>
          <ArrowSmRightIcon />
        </ControlButton>
      </div>

      {showRestart && (
        <RestartGame
          onRestartClickHandler={onRestartGameClickHandler}
          onCancelClickHandler={onCancelRestartGameClickHandler}
        />
      )}
    </>
  );
};

export default GameControls;
