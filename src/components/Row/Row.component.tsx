import React from "react";

import "./Row.css";
import * as Types from "types";
import CellComponent from "../Cell/Cell.component";

interface RowProps {
  row: Types.Cell[];
  onCellClickHandler: Types.onCellClickHandler;
}

const RowComponent: React.FC<RowProps> = ({ row, onCellClickHandler }) => {
  return (
    <div className="row">
      {row.map(({ piece, position }) => {
        if (!piece) {
          return (
            <CellComponent
              key={position}
              position={position}
              onCellClickHandler={onCellClickHandler}
            />
          );
        }

        return (
          <CellComponent
            key={position}
            position={position}
            piece={piece}
            onCellClickHandler={onCellClickHandler}
          />
        );
      })}
    </div>
  );
};

export default RowComponent;
