import React from "react";

import "./LostPieces.css";
import Piece from "models/Piece";
import PieceComponent from "components/Piece/Piece.component";

interface LostPiecesProps {
  pieces: Piece[];
  advantage: number | null;
}

const LostPieces: React.FC<LostPiecesProps> = ({ pieces, advantage }) => {
  const pawns: Piece[] = [];
  const knights: Piece[] = [];
  const bishops: Piece[] = [];
  const rooks: Piece[] = [];
  const queens: Piece[] = [];
  pieces.forEach((piece) => {
    switch (piece.type) {
      case "pawn":
        pawns.push(piece);
        break;
      case "knight":
        knights.push(piece);
        break;
      case "bishop":
        bishops.push(piece);
        break;
      case "rook":
        rooks.push(piece);
        break;
      case "queen":
        queens.push(piece);
        break;
      default:
        break;
    }
  });

  const className =
    !!pieces[0] && pieces[0].color === "white"
      ? "lost-pieces-container lost-pieces-container--white"
      : "lost-pieces-container";
  return (
    <div className={className}>
      <ul className="lost-pieces-types">
        {!!pawns.length && (
          <li>
            <ul className="lost-pieces">
              {pawns.map((pawn, idx) => (
                <li key={idx} className="lost-piece">
                  <PieceComponent piece={pawn} />
                </li>
              ))}
            </ul>
          </li>
        )}
        {!!knights.length && (
          <li>
            <ul className="lost-pieces">
              {knights.map((knight, idx) => (
                <li key={idx} className="lost-piece">
                  <PieceComponent piece={knight} />
                </li>
              ))}
            </ul>
          </li>
        )}
        {!!bishops.length && (
          <li>
            <ul className="lost-pieces">
              {bishops.map((bishop, idx) => (
                <li key={idx} className="lost-piece">
                  <PieceComponent piece={bishop} />
                </li>
              ))}
            </ul>
          </li>
        )}
        {!!rooks.length && (
          <li>
            <ul className="lost-pieces">
              {rooks.map((rook, idx) => (
                <li key={idx} className="lost-piece">
                  <PieceComponent piece={rook} />
                </li>
              ))}
            </ul>
          </li>
        )}
        {!!queens.length && (
          <li>
            <ul className="lost-pieces">
              {queens.map((queen, idx) => (
                <li key={idx} className="lost-piece">
                  <PieceComponent piece={queen} />
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
      {!!advantage && <span className="advantage">+{advantage}</span>}
    </div>
  );
};

export default LostPieces;
