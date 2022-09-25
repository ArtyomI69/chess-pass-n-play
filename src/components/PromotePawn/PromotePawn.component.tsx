import React, { useContext } from "react";

import "./PromotePawn.css";
import * as Types from "types";
import { GameContext } from "context/GameContext";
import Queen from "models/Queen";
import Rook from "models/Rook";
import Bishop from "models/Bishop";
import Knight from "models/Knight";
import PieceComponent from "components/Piece/Piece.component";
import Modal from "components/UI/Modal/Modal.component";

interface PromotePawnProps {
  color: Types.Color;
  onPromotePawnPieceClickHandler: Types.onPromotePawnPieceClickHandler;
  onPromotePawnModalCloseHandler: () => void;
}

const PromotePawn: React.FC<PromotePawnProps> = ({
  color,
  onPromotePawnPieceClickHandler,
  onPromotePawnModalCloseHandler,
}) => {
  const { activePlayer } = useContext(GameContext);

  const rook = new Rook(color);
  rook.isFirstMove = false;
  const pieces: (Queen | Rook | Bishop | Knight)[] = [
    new Queen(color),
    rook,
    new Bishop(color),
    new Knight(color),
  ];

  const className = activePlayer === "black" ? "promote-pawn promote-pawn--black" : "promote-pawn";
  return (
    <Modal onCloseModal={onPromotePawnModalCloseHandler} turnModal180deg={activePlayer === "black"}>
      <div className={className}>
        <p className="promote-pawn-heading">Promote pawn to?</p>
        <ul className="promote-pawn-pieces">
          {pieces.map((piece, idx) => (
            <li
              key={idx}
              className="promote-pawn-piece"
              onClick={() => onPromotePawnPieceClickHandler(piece)}
            >
              <PieceComponent piece={piece} />
              <p>{piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}</p>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default PromotePawn;
