import React, { useContext } from "react";
import { useDrop } from "react-dnd";

import "./Cell.css";
import * as Types from "types";
import { GameContext } from "context/GameContext";
import Piece from "models/Piece";
import DraggablePiece from "components/DraggablePiece/DraggablePiece.component";

interface CellProps {
  position: string;
  piece?: Piece;
  onCellClickHandler: Types.onCellClickHandler;
}

const CellComponent: React.FC<CellProps> = ({ position, piece, onCellClickHandler }) => {
  const { selected, highlighted, isChecked, activePlayer, movePiece, deselectPiece } =
    useContext(GameContext);
  const [{ isHovering }, dropRef] = useDrop({
    accept: "piece",
    collect: (monitor) => ({ isHovering: monitor.isOver() }),
    drop: () => {
      movePiece(position);
      deselectPiece();
    },
    canDrop: () => !!selected,
  });

  const getCellClass = () => {
    let cellClass = "cell";
    if (isHovering && highlighted.show && highlighted.cells.includes(position))
      cellClass = cellClass.concat(" cell--hovered");

    if (!piece) {
      if (highlighted.show && highlighted.cells.includes(position))
        cellClass = cellClass.concat(" cell--highligted");
      return cellClass;
    }

    if (highlighted.show && highlighted.cells.includes(position))
      cellClass = cellClass.concat(" cell--highligted-piece");
    if (selected?.from === position) cellClass = cellClass.concat(" cell--selected");
    if (piece.type === "king" && isChecked && activePlayer === piece.color)
      cellClass = cellClass.concat(" cell--checked");

    return cellClass;
  };

  const cellClass = getCellClass();
  if (!piece) {
    return (
      <div ref={dropRef} className={cellClass} onClick={() => onCellClickHandler(position)}></div>
    );
  }
  return (
    <div ref={dropRef} className={cellClass} onClick={() => onCellClickHandler(position, piece)}>
      <DraggablePiece piece={piece} position={position} />
    </div>
  );
};

export default CellComponent;
