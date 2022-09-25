import { cloneDeep } from "lodash";

import * as Types from "types";
import { isKingChecked, storePiecesPossibleMoves } from "utils";
import Piece from "./Piece";
import Pawn from "./Pawn";
import whiteKnightImg from "assets/imgs/knight-white.png";
import blackKnightImg from "assets/imgs/knight-black.png";

class Knight extends Piece {
  constructor(color: Types.Color) {
    super("knight", color);
    this.img = color === "white" ? whiteKnightImg : blackKnightImg;
  }

  static fromJSON = (object: Types.KnightJSON) => {
    const newKnight = new Knight(object.color);
    newKnight.possibleMoves = object.possibleMoves;
    newKnight.validPossibleMoves = object.validPossibleMoves;
    return newKnight;
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

    this.storePossibleMovesInOneDirection(board, from, +2, +1);
    this.storePossibleMovesInOneDirection(board, from, +2, -1);
    this.storePossibleMovesInOneDirection(board, from, -2, +1);
    this.storePossibleMovesInOneDirection(board, from, -2, -1);
    this.storePossibleMovesInOneDirection(board, from, +1, +2);
    this.storePossibleMovesInOneDirection(board, from, +1, -2);
    this.storePossibleMovesInOneDirection(board, from, -1, +2);
    this.storePossibleMovesInOneDirection(board, from, -1, -2);

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
  }

  private storePossibleMovesInOneDirection(
    board: Types.Cell[][],
    from: string,
    rowDirection: 2 | -2 | 1 | -1,
    columnDirection: 2 | -2 | 1 | -1
  ) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let toColumn = +fromColumn + columnDirection;
    const inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;

    if (!inBoundaries) return;
    this.possibleMoves.push(`${toRow}${toColumn}`);
  }
}

export default Knight;
