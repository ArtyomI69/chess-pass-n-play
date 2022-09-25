import React from "react";

import Modal2Buttons from "components/UI/Modal2Buttons/Modal2Buttons.component";

interface RestartGameProps {
  onRestartClickHandler: () => void;
  onCancelClickHandler: () => void;
}

const RestartGame: React.FC<RestartGameProps> = ({
  onRestartClickHandler,
  onCancelClickHandler,
}) => {
  const title = "New Game";
  const cancelButton = { title: "Cancel", onClick: onCancelClickHandler };
  const restartButton = { title: "Restart", onClick: onRestartClickHandler };
  return (
    <Modal2Buttons
      title={title}
      onCloseModal={onCancelClickHandler}
      firstButton={cancelButton}
      secondButton={restartButton}
      turnModal180deg={false}
    />
  );
};

export default RestartGame;
