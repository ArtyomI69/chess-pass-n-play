import React, { ReactNode } from "react";
import ReactDom from "react-dom";

import "./Modal.css";

interface ModalOverlayProps {
  children: ReactNode;
  turnModal180deg: boolean;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, turnModal180deg }) => {
  const className = turnModal180deg ? "modal modal--turnModal180deg" : "modal";
  return (
    <div className={className}>
      <div className="Content">{children}</div>
    </div>
  );
};

interface BackdropProps {
  onCloseModal: () => void;
}

const Backdrop: React.FC<BackdropProps> = ({ onCloseModal }) => {
  return <div className="backdrop" onClick={onCloseModal} />;
};

const portalElement = document.getElementById("modal")!;

interface ModalProps extends ModalOverlayProps, BackdropProps {}

const Modal: React.FC<ModalProps> = ({ onCloseModal, children, turnModal180deg }) => {
  return (
    <>
      {ReactDom.createPortal(<Backdrop onCloseModal={onCloseModal} />, portalElement)}
      {ReactDom.createPortal(
        <ModalOverlay turnModal180deg={turnModal180deg}>{children}</ModalOverlay>,
        portalElement
      )}
    </>
  );
};

export default Modal;
