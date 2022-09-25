import React from "react";
import { useDragLayer } from "react-dnd";

import "./CustomDragLayer.css";
import PieceComponent from "components/Piece/Piece.component";

const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const getItemStyles = () => {
    if (!currentOffset) {
      return {
        display: "none",
      };
    }
    const { x, y } = currentOffset;
    const transform = `translate(${x - 30}px, ${y - 27}px)`;
    return {
      transform,
      WebkitTransform: transform,
    };
  };

  if (!isDragging) {
    return null;
  }

  const renderItem = () => {
    if (itemType === "piece") return <PieceComponent piece={item} />;
    return null;
  };

  return (
    <div className="custom-drag-layer" style={getItemStyles()}>
      {renderItem()}
    </div>
  );
};

export default CustomDragLayer;
