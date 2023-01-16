import React from "react";

import "./Board.css";
import * as Types from "types";
import RowComponent from "../Row/Row.component";

interface BoardProps {
  board: Types.Cell[][];
  onCellClickHandler: Types.onCellClickHandler;
}

const BoardComponent: React.FC<BoardProps> = ({ board, onCellClickHandler }) => {
  return (
    <div className="board">
      {board.map((row, idx) => (
        <RowComponent key={idx} row={row} onCellClickHandler={onCellClickHandler} />
      ))}
    </div>
  );
};

export default BoardComponent;
