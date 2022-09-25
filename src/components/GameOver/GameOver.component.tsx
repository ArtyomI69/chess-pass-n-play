import React from "react";

import "Queries.css";
import * as Types from "types";
import Modal2Buttons from "components/UI/Modal2Buttons/Modal2Buttons.component";

interface GameOverProps {
  gameOver: Types.GameOver;
  winner: Types.Color;
  onAnalysisClickHandler: () => void;
  onReplayClickHandler: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
  gameOver,
  winner,
  onAnalysisClickHandler,
  onReplayClickHandler,
}) => {
  const title = gameOver.type === "checkMate" ? `${winner.toUpperCase()} WIN!` : "TIE!";
  const analysisButton = { title: "Analysis", onClick: onAnalysisClickHandler };
  const replayButton = { title: "Replay", onClick: onReplayClickHandler };
  return (
    <Modal2Buttons
      title={title}
      onCloseModal={onAnalysisClickHandler}
      firstButton={analysisButton}
      secondButton={replayButton}
      turnModal180deg={false}
    />
  );
};

export default GameOver;
