import React, { useContext, useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import "./DraggablePiece.css";
import { GameContext } from "context/GameContext";
import Piece from "models/Piece";
import PieceComponent from "components/Piece/Piece.component";

interface PieceProps {
  piece: Piece;
  position: string;
}

const DraggablePiece: React.FC<PieceProps> = ({ piece, position }) => {
  const { activePlayer, selectPiece } = useContext(GameContext);
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: "piece",
    item: piece,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: () => piece.color === activePlayer,
  });

  useEffect(() => {
    if (isDragging) selectPiece(piece, position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  return (
    <div className="draggable-piece" style={isDragging ? { opacity: 0 } : {}} ref={dragRef}>
      <PieceComponent piece={piece} />
    </div>
  );
};

export default DraggablePiece;
