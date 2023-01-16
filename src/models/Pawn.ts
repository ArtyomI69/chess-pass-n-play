import { cloneDeep } from "lodash";

import * as Types from "types";
import { isKingChecked, storePiecesPossibleMoves } from "utils";
import Piece from "./Piece";
import whitePawnImg from "assets/imgs/pawn-white.png";
import blackPawnImg from "assets/imgs/pawn-black.png";

class Pawn extends Piece {
  static enPassant: string | null = null;
  possibleMovesForward: string[] = [];
  private isFirstMove = true;

  constructor(color: Types.Color) {
    super("pawn", color);
    this.img = color === "white" ? whitePawnImg : blackPawnImg;
  }

  static fromJSON = (object: Types.PawnJSON) => {
    const newPawn = new Pawn(object.color);
    newPawn.possibleMoves = object.possibleMoves;
    newPawn.validPossibleMoves = object.validPossibleMoves;
    newPawn.possibleMovesForward = object.possibleMovesForward;
    newPawn.isFirstMove = object.isFirstMove;
    return newPawn;
  };

  static disablingEnPassant() {
    Pawn.enPassant = null;
  }

  move(board: Types.Cell[][], from: string, to: string) {
    if (!this.validPossibleMoves.includes(to)) return { newBoard: board, lostPiece: null };
    const [fromRow, fromColumn] = from.split("");
    const [toRow, toColumn] = to.split("");

    let lostPiece: Piece | null = null;
    if (board[+toRow][+toColumn].piece) lostPiece = board[+toRow][+toColumn].piece;
    board[+toRow][+toColumn].piece = this;
    board[+fromRow][+fromColumn].piece = null;

    // If en Passant attack was made
    if (Pawn.enPassant === `${toRow}${toColumn}`) {
      lostPiece = this.enPassantAttack(board, to);
    }

    const moveLength = Math.abs(+toRow - +fromRow);
    let isEnPassantBeenEnabled = false;
    // Disabling firstMove option for pawns that made move and enabling en Passant if possible
    if (this.isFirstMove) {
      this.isFirstMove = false;

      // Enabling en Passant move if possible
      if (moveLength === 2) {
        isEnPassantBeenEnabled = true;
        this.enablingEnPassant(to);
      }
    }

    if (moveLength !== 2 && !isEnPassantBeenEnabled) {
      Pawn.disablingEnPassant();
    }

    return { newBoard: board, lostPiece };
  }

  storePossibleMoves(board: Types.Cell[][], from: string, withValidation: boolean) {
    this.clearPossibleMoves();
    this.clearPossibleMovesForward();

    // Store possible attacks and en Passant
    if (this.color === "white") {
      this.storePossibleAttacksInOneDirection(from, +1, +1);
      this.storePossibleAttacksInOneDirection(from, +1, -1);
    } else {
      this.storePossibleAttacksInOneDirection(from, -1, +1);
      this.storePossibleAttacksInOneDirection(from, -1, -1);
    }

    // Store Possible moves forward
    if (this.color === "white") {
      this.storePossibleMovesForward(board, from, +1);
    } else {
      this.storePossibleMovesForward(board, from, -1);
    }

    // Stroring valid possible moves (AKA are you checked?)
    if (withValidation) this.storeValidPossibleMoves(board);

    return board;
  }

  protected fakeMove(board: Types.Cell[][], from: string, to: string) {
    // We need to disable enPassant attack after some piece was moved
    const [fromRow, fromColumn] = from.split("");
    const [toRow, toColumn] = to.split("");

    board[+toRow][+toColumn].piece = this;
    board[+fromRow][+fromColumn].piece = null;

    // If en Passant attack was made
    if (Pawn.enPassant === `${toRow}${toColumn}`) {
      this.enPassantAttack(board, to);
    }

    return board;
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
    const possibleMovesForwardCopy = [...this.possibleMovesForward];

    const from = getPieceCell().position;

    const possibleMoves = this.possibleMoves.filter((to) => {
      const [toRow, toColumn] = to.split("");

      const isCellWithPiece = !!board[+toRow][+toColumn].piece;
      const isCellWithOponentPiece =
        isCellWithPiece && board[+toRow][+toColumn].piece?.color !== this.color;
      const isCellEnPassantAttack = Pawn.enPassant === `${toRow}${toColumn}`;

      if (!isCellWithOponentPiece && !isCellEnPassantAttack) return false;

      const boardCopy = cloneDeep(board);
      if (boardCopy[+toRow][+toColumn].piece?.type === "king") return false;
      this.fakeMove(boardCopy, from, to);
      // We need to pass false as withValidation argument to storePiecesPossibleMoves to avoid stack overflow
      storePiecesPossibleMoves(boardCopy, this.color, false);

      return !isKingChecked(boardCopy, this.color);
    });

    // Prevent bug when wrong moves stored
    this.possibleMoves = [...possibleMovesCopy];
    this.possibleMovesForward = [...possibleMovesForwardCopy];

    const possibleMovesForward = this.possibleMovesForward.filter((to) => {
      const [toRow, toColumn] = to.split("");
      const boardCopy = cloneDeep(board);
      if (boardCopy[+toRow][+toColumn].piece?.type === "king") return false;
      this.fakeMove(boardCopy, from, to);
      // We need to pass false as withValidation argument to storePiecesPossibleMoves to avoid stack overflow
      storePiecesPossibleMoves(boardCopy, this.color, false);

      return !isKingChecked(boardCopy, this.color);
    });

    // Prevent bug when wrong moves stored
    this.possibleMoves = [...possibleMovesCopy];
    this.possibleMovesForward = [...possibleMovesForwardCopy];

    this.validPossibleMoves = [...possibleMoves, ...possibleMovesForward];
  }

  private clearPossibleMovesForward() {
    this.possibleMovesForward = [];
  }

  private storePossibleMovesForward(board: Types.Cell[][], from: string, rowDirection: number) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let inBoundaries = toRow >= 0 && toRow <= 7;

    let i = 1;
    const lengthOfMove = this.isFirstMove ? 2 : 1;
    while (inBoundaries && !board[toRow][+fromColumn].piece && i <= lengthOfMove) {
      this.possibleMovesForward.push(`${toRow}${fromColumn}`);
      toRow += rowDirection;
      i++;

      inBoundaries = toRow >= 0 && toRow <= 7;
      if (!inBoundaries) break;
    }
  }

  private storePossibleAttacksInOneDirection(
    from: string,
    rowDirection: 1 | -1,
    columnDirection: 1 | -1
  ) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let toColumn = +fromColumn + columnDirection;

    const inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;
    if (!inBoundaries) return;
    this.possibleMoves.push(`${toRow}${toColumn}`);
  }

  private enablingEnPassant(to: string) {
    const [toRow, toColumn] = to.split("");

    const row =
      this.color === "white" ? `${(+toRow - 1).toString()}` : `${(+toRow + 1).toString()}`;

    Pawn.enPassant = `${row}${toColumn}`;
  }

  private enPassantAttack(board: Types.Cell[][], to: string) {
    const [toRow, toColumn] = to.split("");

    let lostPiece: Piece | null = null;
    if (this.color === "white") {
      lostPiece = board[+toRow - 1][+toColumn].piece;
      board[+toRow - 1][+toColumn].piece = null;
    } else {
      lostPiece = board[+toRow + 1][+toColumn].piece;
      board[+toRow + 1][+toColumn].piece = null;
    }

    return lostPiece;
  }
}

export default Pawn;
