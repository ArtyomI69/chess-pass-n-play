import React, { ReactNode } from "react";

import "./ControlButton.css";

interface ControlButtonProps {
  children: ReactNode;
  onClickHandler: () => void;
}

const ControlButton: React.FC<ControlButtonProps> = ({ children, onClickHandler }) => (
  <button className="control-button" onClick={onClickHandler}>
    {children}
  </button>
);

export default ControlButton;
