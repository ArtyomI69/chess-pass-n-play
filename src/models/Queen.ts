import { cloneDeep } from "lodash";

import * as Types from "types";
import { isKingChecked, storePiecesPossibleMoves } from "utils";
import Piece from "./Piece";
import Pawn from "./Pawn";
import whiteQueenImg from "assets/imgs/queen-white.png";
import blackQueenImg from "assets/imgs/queen-black.png";

class Queen extends Piece {
  // We need this field to make sure that
  // king can't move on cells that attacked but
  // not included in possibleMoves array
  attackedCells: string[] = [];

  constructor(color: Types.Color) {
    super("queen", color);
    this.img = color === "white" ? whiteQueenImg : blackQueenImg;
  }

  static fromJSON = (object: Types.QueenJSON) => {
    const newQueen = new Queen(object.color);
    newQueen.possibleMoves = object.possibleMoves;
    newQueen.validPossibleMoves = object.validPossibleMoves;
    newQueen.attackedCells = object.attackedCells;
    return newQueen;
  };

  move(board: Types.Cell[][], from: string, to: string) {
    if (!this.validPossibleMoves.includes(to)) return { newBoard: board, lostPiece: null };
    // We need to disable enPassant attack after some piece was moved
    Pawn.disablingEnPassant();

    const [fromRow, fromColumn] = from.split("");
    const [toRow, toColumn] = to.split("");

    let lostPiece: Piece | null = null;
    if (board[+toRow][+toColumn].piece) lostPiece = board[+toRow][+toColumn].piece;
    board[+toRow][+toColumn].piece = this;
    board[+fromRow][+fromColumn].piece = null;

    return { newBoard: board, lostPiece };
  }

  storePossibleMoves(board: Types.Cell[][], from: string, withValidation: boolean) {
    this.clearPossibleMoves();
    this.clearAttackedCells();

    // Horisontal and vertical moves
    this.storePossibleMovesInOneDirection(board, from, +1, 0);
    this.storePossibleMovesInOneDirection(board, from, -1, 0);
    this.storePossibleMovesInOneDirection(board, from, 0, +1);
    this.storePossibleMovesInOneDirection(board, from, 0, -1);

    // Diagonal moves
    this.storePossibleMovesInOneDirection(board, from, +1, +1);
    this.storePossibleMovesInOneDirection(board, from, +1, -1);
    this.storePossibleMovesInOneDirection(board, from, -1, +1);
    this.storePossibleMovesInOneDirection(board, from, -1, -1);

    // Stroring valid possible moves (AKA are you checked?)
    if (withValidation) this.storeValidPossibleMoves(board);
  }

  private storeValidPossibleMoves(board: Types.Cell[][]) {
    const getPieceCell = () => {
      let pieceCell!: Types.Cell;
      for (const row of board) {
        for (const cell of row) {
          if (cell.piece === this) pieceCell = cell;
        }
      }
      return pieceCell;
    };

    // We need store copy to prevent bug when wrong moves stored
    const possibleMovesCopy = [...this.possibleMoves];
    const attackedCells = [...this.attackedCells];

    const from = getPieceCell().position;
    this.validPossibleMoves = this.possibleMoves.filter((to) => {
      const [toRow, toColumn] = to.split("");

      const isEmptyCell = !board[+toRow][+toColumn].piece;
      const isCellWithOponentPiece = board[+toRow][+toColumn].piece?.color !== this.color;

      if (!isEmptyCell && !isCellWithOponentPiece) return false;

      const boardCopy = cloneDeep(board);
      if (boardCopy[+toRow][+toColumn].piece?.type === "king") return false;
      this.fakeMove(boardCopy, from, to);
      // We need to pass false as withValidation argument to storePiecesPossibleMoves to avoid stack overflow
      storePiecesPossibleMoves(boardCopy, this.color, false);

      return !isKingChecked(boardCopy, this.color);
    });

    // Prevent bug when wrong moves stored
    this.possibleMoves = [...possibleMovesCopy];
    this.attackedCells = [...attackedCells];
  }

  private storePossibleMovesInOneDirection(
    board: Types.Cell[][],
    from: string,
    rowDirection: 1 | 0 | -1,
    columnDirection: 1 | 0 | -1
  ) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let toColumn = +fromColumn + columnDirection;
    let inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;

    while (inBoundaries && !board[toRow][toColumn].piece) {
      this.possibleMoves.push(`${toRow}${toColumn}`);
      toRow += rowDirection;
      toColumn += columnDirection;

      inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;
    }
    if (inBoundaries) {
      this.possibleMoves.push(`${toRow}${toColumn}`);
    }

    // Filling attackedCells array
    const isAttackedPieceOponentKing =
      inBoundaries &&
      board[toRow][toColumn].piece!.color !== this.color &&
      board[toRow][toColumn].piece!.type === "king";
    if (isAttackedPieceOponentKing) {
      const fromOpponentKingCell = `${toRow}${toColumn}`;
      this.storeAttackedCells(board, fromOpponentKingCell, rowDirection, columnDirection);
    }
  }

  private clearAttackedCells() {
    this.attackedCells = [];
  }

  private storeAttackedCells(
    board: Types.Cell[][],
    from: string,
    rowDirection: 1 | 0 | -1,
    columnDirection: 1 | 0 | -1
  ) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let toColumn = +fromColumn + columnDirection;
    let inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;

    while (inBoundaries && !board[toRow][toColumn].piece) {
      this.attackedCells.push(`${toRow}${toColumn}`);
      toRow += rowDirection;
      toColumn += columnDirection;

      inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;
    }
  }
}

export default Queen;
