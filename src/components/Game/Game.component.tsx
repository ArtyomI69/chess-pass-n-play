import React, { useContext } from "react";

import "./Game.css";
import * as Types from "types";
import { GameContext } from "context/GameContext";
import CustomDragLayer from "components/CustomDragLayer/CustomDragLayer.component";
import BoardComponent from "components/Board/Board.component";
import PromotePawn from "components/PromotePawn/PromotePawn.component";
import LostPiecesComponent from "components/LostPieces/LostPieces.component";
import GameOver from "components/GameOver/GameOver.component";

const Game: React.FC = () => {
  const {
    board,
    activePlayer,
    lostPieces,
    selected,
    promoting,
    gameOver,
    restartGame,
    hideGameOver,
    selectPiece,
    deselectPiece,
    movePiece,
    finishPromotingPawn,
    cancelPromotingPawn,
  } = useContext(GameContext);

  const getAdvantageByPieces = () => {
    const piecesPoints: { [name: string]: number } = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 10,
    };

    let whiteScore = 0;
    let blackScore = 0;
    for (const row of board) {
      for (const cell of row) {
        const { piece } = cell;
        if (piece && piece.type !== "king") {
          const piecePoints = piecesPoints[piece.type];
          if (piece.color === "white") whiteScore += piecePoints;
          else blackScore += piecePoints;
        }
      }
    }

    const advantage = Math.abs(whiteScore - blackScore);
    const color: Types.Color = whiteScore > blackScore ? "black" : "white";

    return { advantage, color };
  };

  const onCellClickHandler: Types.onCellClickHandler = (position, piece?) => {
    if (!selected) {
      // Do nothing if empty cell or piece of opponent was sellected
      if (!piece || piece.color !== activePlayer) return;

      // Selecting piece if none was selected before
      return selectPiece(piece, position);
    }

    // Deselect selected piece if empty cell or opponent piece was clicked
    // or select another your piece
    if (!selected.piece.validPossibleMoves.includes(position)) {
      if (piece && piece.color === selected.piece.color) {
        return selectPiece(piece, position);
      }
      return deselectPiece();
    }

    movePiece(position);
  };

  const onPromotePawnPieceClickHandler: Types.onPromotePawnPieceClickHandler = (piece) => {
    finishPromotingPawn(piece);
  };

  const onPromotePawnModalCloseHandler = () => {
    cancelPromotingPawn();
  };

  const onAnalysisClickHandler = () => {
    hideGameOver();
  };

  const onReplayClickHandler = () => {
    restartGame();
  };

  const { advantage, color } = getAdvantageByPieces();
  const game = activePlayer === "white" ? "game" : "game game--inverted";
  return (
    <>
      <div className={game}>
        <LostPiecesComponent
          pieces={lostPieces.white}
          advantage={color === "white" ? advantage : null}
        />
        <BoardComponent board={board} onCellClickHandler={onCellClickHandler} />
        <LostPiecesComponent
          pieces={lostPieces.black}
          advantage={color === "black" ? advantage : null}
        />
      </div>

      {promoting && (
        <PromotePawn
          color={promoting.color}
          onPromotePawnPieceClickHandler={onPromotePawnPieceClickHandler}
          onPromotePawnModalCloseHandler={onPromotePawnModalCloseHandler}
        />
      )}
      {gameOver.show && !!gameOver.type && (
        <GameOver
          gameOver={gameOver}
          winner={activePlayer === "white" ? "black" : "white"}
          onAnalysisClickHandler={onAnalysisClickHandler}
          onReplayClickHandler={onReplayClickHandler}
        />
      )}

      <CustomDragLayer />
    </>
  );
};

export default Game;
