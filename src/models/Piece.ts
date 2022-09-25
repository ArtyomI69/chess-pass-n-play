import * as Types from "types";
import pieceImg from "assets/imgs/king-white.png";

abstract class Piece {
  type: Types.PieceType;
  color: Types.Color;
  img: typeof pieceImg;
  possibleMoves: string[] = [];
  validPossibleMoves: string[] = [];

  constructor(type: Types.PieceType, color: Types.Color) {
    this.type = type;
    this.color = color;
  }

  abstract move(
    board: Types.Cell[][],
    from: string,
    to: string
  ): { newBoard: Types.Cell[][]; lostPiece: Piece | null; hasCastled?: boolean };
  abstract storePossibleMoves(board: Types.Cell[][], from: string, withValidation: boolean): void;

  protected clearPossibleMoves() {
    this.possibleMoves = [];
    this.validPossibleMoves = [];
  }

  protected fakeMove(board: Types.Cell[][], from: string, to: string) {
    const [fromRow, fromColumn] = from.split("");
    const [toRow, toColumn] = to.split("");

    board[+toRow][+toColumn].piece = this;
    board[+fromRow][+fromColumn].piece = null;

    return board;
  }

  showPossibleMoves() {
    return [...this.validPossibleMoves];
  }
}

export default Piece;
