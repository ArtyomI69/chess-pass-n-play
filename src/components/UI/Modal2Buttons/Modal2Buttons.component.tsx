import React from "react";

import "./Modal2Buttons.css";
import Modal from "components/UI/Modal/Modal.component";

interface ModalButton {
  title: string;
  onClick: () => void;
}

interface Modal2ButtonsProps {
  title: string;
  firstButton: ModalButton;
  secondButton: ModalButton;
  onCloseModal: () => void;
  turnModal180deg: boolean;
}

const Modal2Buttons: React.FC<Modal2ButtonsProps> = ({
  title,
  firstButton,
  secondButton,
  onCloseModal,
  turnModal180deg,
}) => {
  return (
    <Modal onCloseModal={onCloseModal} turnModal180deg={turnModal180deg}>
      <div className="modal-two-buttons">
        <p className="modal-two-buttons-heading">{title}</p>
        <div className="modal-two-buttons-buttons">
          <button
            onClick={firstButton.onClick}
            className="modal-two-buttons-button modal-two-buttons-button--first-button"
          >
            {firstButton.title}
          </button>
          <button
            onClick={secondButton.onClick}
            className="modal-two-buttons-button modal-two-buttons-button--second-button"
          >
            {secondButton.title}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal2Buttons;
