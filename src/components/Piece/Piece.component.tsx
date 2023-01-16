import React from "react";

import "./Piece.css";
import Piece from "models/Piece";

interface PieceProps {
  piece: Piece;
}

const PieceComponent: React.FC<PieceProps> = ({ piece }) => {
  const { color, type, img } = piece;

  const className = color === "black" ? "piece piece--black" : "piece";
  return (
    <div className={className}>
      <img src={img} alt={`${color.charAt(0).toUpperCase() + color.slice(1)} ${type}`}></img>
    </div>
  );
};

export default PieceComponent;
