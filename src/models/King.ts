import * as Types from "types";
import { getAttackedCells, isKingChecked } from "utils";
import Piece from "./Piece";
import Rook from "./Rook";
import Pawn from "./Pawn";
import whiteKingImg from "assets/imgs/king-white.png";
import blackKingImg from "assets/imgs/king-black.png";

class King extends Piece {
  private isFirstMove = true;
  private possibleCastleMoves: string[] = [];

  constructor(color: Types.Color) {
    super("king", color);
    this.img = color === "white" ? whiteKingImg : blackKingImg;
  }

  static fromJSON = (object: Types.KingJSON) => {
    const newKing = new King(object.color);
    newKing.possibleMoves = object.possibleMoves;
    newKing.validPossibleMoves = object.validPossibleMoves;
    newKing.isFirstMove = object.isFirstMove;
    newKing.possibleCastleMoves = object.possibleCastleMoves;
    return newKing;
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

    let hasCastled = false;
    if (this.isFirstMove) {
      this.isFirstMove = false;

      // Castle if needed
      hasCastled = this.castle(board, toColumn);
    }

    return { newBoard: board, lostPiece, hasCastled };
  }

  storePossibleMoves(board: Types.Cell[][], from: string) {
    this.clearPossibleMoves();
    this.clearPossibleCastleMoves();

    this.storePossibleMovesInOneDirection(from, 1, 1);
    this.storePossibleMovesInOneDirection(from, 1, 0);
    this.storePossibleMovesInOneDirection(from, 1, -1);
    this.storePossibleMovesInOneDirection(from, 0, 1);
    this.storePossibleMovesInOneDirection(from, 0, -1);
    this.storePossibleMovesInOneDirection(from, -1, 1);
    this.storePossibleMovesInOneDirection(from, -1, 0);
    this.storePossibleMovesInOneDirection(from, -1, -1);

    // Storing possible castleMoves
    this.storePossibleCastleMoves(board);

    // Storing valid possible moves that not attacked
    this.storeValidPossibleMoves(board);
  }

  private storeValidPossibleMoves(board: Types.Cell[][]) {
    const attackedCells = getAttackedCells(board, this.color);

    // Making sure that possible moves not attacked
    const possibleMoves = this.possibleMoves.filter((cell) => {
      const [toRow, toColumn] = cell.split("");

      const isEmptyCell = !board[+toRow][+toColumn].piece;
      const isCellWithOponentPiece = board[+toRow][+toColumn].piece?.color !== this.color;

      if (!isEmptyCell && !isCellWithOponentPiece) return false;

      return !attackedCells.includes(cell);
    });
    this.validPossibleMoves = [...possibleMoves, ...this.possibleCastleMoves];
  }

  private clearPossibleCastleMoves() {
    this.possibleCastleMoves = [];
  }

  private storePossibleCastleMoves(board: Types.Cell[][]) {
    const isChecked = isKingChecked(board, this.color);
    if (isChecked || !this.isFirstMove) return;

    const attackedCells = getAttackedCells(board, this.color);

    let hasRookNotMoved: boolean;
    let hasCellToCastleAttacked: boolean;

    if (this.color === "white") {
      hasRookNotMoved =
        board[0][7].piece instanceof Rook &&
        board[0][7].piece.isFirstMove &&
        board[0][7].piece.color === this.color;
      hasCellToCastleAttacked = attackedCells.includes(`06`) || attackedCells.includes(`05`);
      if (!board[0][5].piece && !board[0][6].piece && hasRookNotMoved && !hasCellToCastleAttacked) {
        this.possibleCastleMoves.push(`06`);
      }

      hasRookNotMoved =
        board[0][0].piece instanceof Rook &&
        board[0][0].piece.isFirstMove &&
        board[0][0].piece.color === this.color;
      hasCellToCastleAttacked = attackedCells.includes(`02`) || attackedCells.includes(`03`);
      if (
        !board[0][1].piece &&
        !board[0][2].piece &&
        !board[0][3].piece &&
        hasRookNotMoved &&
        !hasCellToCastleAttacked
      ) {
        this.possibleCastleMoves.push(`02`);
      }
    } else {
      hasRookNotMoved =
        board[7][7].piece instanceof Rook &&
        board[7][7].piece.isFirstMove &&
        board[7][7].piece.color === this.color;
      hasCellToCastleAttacked = attackedCells.includes(`76`) || attackedCells.includes(`75`);
      if (!board[7][5].piece && !board[7][6].piece && hasRookNotMoved && !hasCellToCastleAttacked) {
        this.possibleCastleMoves.push(`76`);
      }

      hasRookNotMoved =
        board[7][0].piece instanceof Rook &&
        board[7][0].piece.isFirstMove &&
        board[7][0].piece.color === this.color;
      hasCellToCastleAttacked = attackedCells.includes(`72`) || attackedCells.includes(`73`);
      if (
        !board[7][1].piece &&
        !board[7][2].piece &&
        !board[7][3].piece &&
        hasRookNotMoved &&
        !hasCellToCastleAttacked
      ) {
        this.possibleCastleMoves.push(`72`);
      }
    }
  }

  private storePossibleMovesInOneDirection(
    from: string,
    rowDirection: 1 | 0 | -1,
    columnDirection: 1 | 0 | -1
  ) {
    const [fromRow, fromColumn] = from.split("");

    let toRow = +fromRow + rowDirection;
    let toColumn = +fromColumn + columnDirection;
    let inBoundaries = toRow >= 0 && toRow <= 7 && toColumn >= 0 && toColumn <= 7;

    if (!inBoundaries) return;
    this.possibleMoves.push(`${toRow}${toColumn}`);
  }

  private castle(board: Types.Cell[][], toColumn: string) {
    let hasCastled = false;
    if (this.color === "white") {
      if (toColumn === "6") {
        const rook = board[0][7].piece as Rook;
        board[0][7].piece = null;
        rook.isFirstMove = false;
        board[0][5].piece = rook;
        hasCastled = true;
      }

      if (toColumn === "2") {
        const rook = board[0][0].piece as Rook;
        board[0][0].piece = null;
        rook.isFirstMove = false;
        board[0][3].piece = rook;
        hasCastled = true;
      }
    } else {
      if (toColumn === "6") {
        const rook = board[7][7].piece as Rook;
        board[7][7].piece = null;
        rook.isFirstMove = false;
        board[7][5].piece = rook;
        hasCastled = true;
      }

      if (toColumn === "2") {
        const rook = board[7][0].piece as Rook;
        board[7][0].piece = null;
        rook.isFirstMove = false;
        board[7][3].piece = rook;
        hasCastled = true;
      }
    }
    return hasCastled;
  }
}

export default King;
