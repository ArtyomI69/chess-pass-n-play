import * as Types from "types";
import King from "models/King";
import Rook from "models/Rook";
import Bishop from "models/Bishop";
import Queen from "models/Queen";

export const getAttackedCells = (board: Types.Cell[][], color: Types.Color) => {
  let attackedCells: string[] = [];
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell.piece && cell.piece.color !== color) {
        attackedCells.push(...cell.piece.possibleMoves);
        if (
          cell.piece instanceof Rook ||
          cell.piece instanceof Bishop ||
          cell.piece instanceof Queen
        ) {
          attackedCells.push(...cell.piece.attackedCells);
        }
      }
    })
  );
  // Removing duplicates
  attackedCells = Array.from(new Set(attackedCells));

  return attackedCells;
};

export const isKingChecked = (board: Types.Cell[][], color: Types.Color) => {
  let kingCell!: Types.Cell;
  for (const row of board) {
    for (const cell of row) {
      const { piece } = cell;
      if (piece && piece.type === "king" && piece.color === color) kingCell = cell;
    }
  }
  const attackedCells = getAttackedCells(board, color);
  const isChecked = attackedCells.includes(kingCell.position);
  return isChecked;
};

// We need to store pieces possible moves to look for Checks and Checkmates
export const storePiecesPossibleMoves = (
  board: Types.Cell[][],
  playerColor: Types.Color = "white",
  withValidation: boolean = true
) => {
  let whiteKingCell: Types.Cell;
  let blackKingCell: Types.Cell;
  for (const row of board) {
    for (const cell of row) {
      if (cell.piece) {
        if (cell.piece.type !== "king")
          cell.piece.storePossibleMoves(board, cell.position, withValidation);
        else cell.piece.color === "white" ? (whiteKingCell = cell) : (blackKingCell = cell);
      }
    }
  }

  if (playerColor === "white") {
    (whiteKingCell!.piece! as King).storePossibleMoves(board, whiteKingCell!.position);
    (blackKingCell!.piece! as King).storePossibleMoves(board, blackKingCell!.position);
  } else {
    (blackKingCell!.piece! as King).storePossibleMoves(board, blackKingCell!.position);
    (whiteKingCell!.piece! as King).storePossibleMoves(board, whiteKingCell!.position);
  }
  return board;
};
