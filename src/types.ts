import Piece from "./models/Piece";
import Queen from "./models/Queen";
import Rook from "./models/Rook";
import Bishop from "./models/Bishop";
import Knight from "./models/Knight";
import emptySound from "assets/sounds/emptySound.mp3";

export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type Color = "white" | "black";
export interface Cell {
  piece: Piece | null;
  position: string;
}

export interface LostPieces {
  white: Piece[];
  black: Piece[];
}

export interface Selected {
  piece: Piece;
  from: string;
}

export interface Highlighted {
  show: boolean;
  cells: string[];
}

export interface Turn {
  board: Cell[][];
  lostPieces: LostPieces;
  activePlayer: Color;
  isChecked: boolean;
  enPassant: string | null;
  sound: typeof emptySound | undefined;
}

export interface History {
  curentTurn: number;
  turns: Turn[];
  movingThroughHistory: boolean;
}

export type onCellClickHandler = (position: string, piece?: Piece) => void;
export type onPromotePawnPieceClickHandler = (piece: Queen | Rook | Bishop | Knight) => void;

export interface Promoting {
  from: string;
  to: string;
  color: Color;
}

export interface PromotingPawnPiece {
  pieceName: PieceType;
  piece: Queen | Rook | Bishop | Knight;
}

export interface GameOver {
  type: null | "checkMate" | "tie";
  show: boolean;
}

export interface PawnJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
  possibleMovesForward: string[];
  isFirstMove: boolean;
}

export interface KnightJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
}

export interface BishopJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
  attackedCells: string[];
}

export interface RookJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
  isFirstMove: boolean;
  attackedCells: string[];
}

export interface QueenJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
  attackedCells: string[];
}

export interface KingJSON {
  color: Color;
  possibleMoves: string[];
  validPossibleMoves: string[];
  isFirstMove: boolean;
  possibleCastleMoves: string[];
}
