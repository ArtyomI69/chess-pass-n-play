import React, { useEffect, useRef, createContext, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { Howl } from "howler";

import * as Types from "types";
import { useUpdateEffect } from "hooks/useUpdateEffect";
import { storePiecesPossibleMoves, isKingChecked } from "utils";
import Piece from "models/Piece";
import Pawn from "models/Pawn";
import Rook from "models/Rook";
import Knight from "models/Knight";
import Bishop from "models/Bishop";
import Queen from "models/Queen";
import King from "models/King";
import moveSound from "assets/sounds/move.mp3";
import captureSound from "assets/sounds/capture.mp3";
import castleSound from "assets/sounds/castle.mp3";
import checkSound from "assets/sounds/check.mp3";
import gameStartSound from "assets/sounds/gameStart.mp3";
import gameOverSound from "assets/sounds/gameOver.mp3";
import emptySound from "assets/sounds/empty.mp3";
import moveHistorySound from "assets/sounds/moveHistory.mp3";

const initializeBoard = () => {
  const board: Types.Cell[][] = Array.from(Array(8), () => []);

  const firstRow: Types.Cell[] = [
    { piece: new Rook("white"), position: "00" },
    { piece: new Knight("white"), position: "01" },
    { piece: new Bishop("white"), position: "02" },
    { piece: new Queen("white"), position: "03" },
    { piece: new King("white"), position: "04" },
    { piece: new Bishop("white"), position: "05" },
    { piece: new Knight("white"), position: "06" },
    { piece: new Rook("white"), position: "07" },
  ];

  const secondRow: Types.Cell[] = [];
  for (let i = 0; i < 8; i++) {
    const pawn: Types.Cell = { piece: new Pawn("white"), position: `1${i}` };
    secondRow.push(pawn);
  }
  const seventhRow: Types.Cell[] = [];
  for (let i = 0; i < 8; i++) {
    const pawn: Types.Cell = { piece: new Pawn("black"), position: `6${i}` };
    seventhRow.push(pawn);
  }

  const eighthRow: Types.Cell[] = [
    { piece: new Rook("black"), position: "70" },
    { piece: new Knight("black"), position: "71" },
    { piece: new Bishop("black"), position: "72" },
    { piece: new Queen("black"), position: "73" },
    { piece: new King("black"), position: "74" },
    { piece: new Bishop("black"), position: "75" },
    { piece: new Knight("black"), position: "76" },
    { piece: new Rook("black"), position: "77" },
  ];

  board[0] = firstRow;
  board[1] = secondRow;
  for (let i = 2; i <= 5; i++) {
    for (let j = 0; j < 8; j++) {
      board[i][j] = { position: `${i}${j}`, piece: null };
    }
  }
  board[6] = seventhRow;
  board[7] = eighthRow;

  storePiecesPossibleMoves(board);

  return board;
};

const defaultHistory: Types.History = {
  curentTurn: 0,
  turns: [
    {
      board: initializeBoard(),
      activePlayer: "white",
      isChecked: false,
      lostPieces: { white: [], black: [] },
      enPassant: null,
      sound: emptySound,
    },
  ],
  movingThroughHistory: false,
};

export const GameContext = createContext<{
  board: Types.Cell[][];
  activePlayer: Types.Color;
  lostPieces: Types.LostPieces;
  selected: Types.Selected | null;
  highlighted: Types.Highlighted;
  promoting: Types.Promoting | null;
  isChecked: boolean;
  gameOver: Types.GameOver;
  goBackHistory: () => void;
  goForwardHistory: () => void;
  restartGame: () => void;
  hideGameOver: () => void;
  togglePossibleMoves: () => void;
  selectPiece: (piece: Piece, from: string) => void;
  deselectPiece: () => void;
  movePiece: (to: string) => void;
  startPromotingPawn: (from: string, to: string, color: Types.Color) => void;
  finishPromotingPawn: (piece: Queen | Rook | Bishop | Knight) => void;
  cancelPromotingPawn: () => void;
}>({
  board: initializeBoard(),
  activePlayer: "white",
  lostPieces: { white: [], black: [] },
  selected: null,
  highlighted: { cells: [], show: true },
  promoting: null,
  isChecked: false,
  gameOver: { type: null, show: false },
  goBackHistory: () => {},
  goForwardHistory: () => {},
  restartGame: () => {},
  hideGameOver: () => {},
  togglePossibleMoves: () => {},
  selectPiece: (piece: Piece, from: string) => {},
  deselectPiece: () => {},
  movePiece: (to: string) => {},
  startPromotingPawn: (from: string, to: string, color: Types.Color) => {},
  finishPromotingPawn: (piece: Queen | Rook | Bishop | Knight) => {},
  cancelPromotingPawn: () => {},
});

const GameContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [board, setBoard] = useState(initializeBoard());
  const [lostPieces, setLostPieces] = useState<Types.LostPieces>({ white: [], black: [] });
  const [activePlayer, setActivePlayer] = useState<Types.Color>("white");
  const [isChecked, setIsChecked] = useState(false);
  const [gameOver, setGameOver] = useState<Types.GameOver>({ type: null, show: false });
  const [history, setHistory] = useState<Types.History>(defaultHistory);
  const [selected, setSelected] = useState<Types.Selected | null>(null);
  const [highlighted, setHighlighted] = useState<Types.Highlighted>({ cells: [], show: true });
  const [promoting, setPromoting] = useState<Types.Promoting | null>(null);
  const soundsRef = useRef<typeof emptySound | null>(emptySound);

  // Only runs first time when app launched to make first emptySound
  useEffect(() => {
    // We need this to produce first(empty) sound
    // otherwise first sound of for example moving piece will not be produced
    new Howl({ src: emptySound, preload: true, html5: true }).play();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUpdateEffect(() => {
    const hasValidPossibleMoves = () => {
      let validPossibleMoves: string[] = [];
      board.forEach((row) =>
        row.forEach((cell) => {
          if (cell.piece && cell.piece.color === activePlayer) {
            validPossibleMoves.push(...cell.piece.validPossibleMoves);
          }
        })
      );

      // Removing duplicates
      validPossibleMoves = Array.from(new Set(validPossibleMoves));

      return validPossibleMoves.length === 0;
    };

    const setGameStatus = () => {
      const isPlayerChecked = isKingChecked(board, activePlayer);
      setIsChecked(isPlayerChecked);

      if (isPlayerChecked) {
        setSound(checkSound);
      }

      // When we moving through history after game ended
      // we dont want to change result of game
      if (!gameOver.type) {
        const isGameOver = hasValidPossibleMoves();

        if (isGameOver) {
          setSound(gameOverSound);
          const gameOverType: Types.GameOver = {
            type: isPlayerChecked ? "checkMate" : "tie",
            show: true,
          };
          setGameOver(gameOverType);
        }
      }
    };

    const updateHistory = () => {
      if (history.movingThroughHistory) {
        return setHistory((prevHistory) => {
          const history = cloneDeep(prevHistory);
          return { ...history, movingThroughHistory: false };
        });
      }

      const soundToSave = soundsRef.current;
      setHistory((prevHistory) => {
        const prevTurns = cloneDeep(prevHistory.turns).slice(0, prevHistory.curentTurn + 1);
        const newTurn: Types.Turn = {
          board: cloneDeep(board),
          activePlayer,
          isChecked: isKingChecked(board, activePlayer),
          lostPieces: cloneDeep(lostPieces),
          enPassant: Pawn.enPassant,
          sound: soundToSave,
        };

        return {
          curentTurn: prevHistory.curentTurn + 1,
          turns: [...prevTurns, newTurn],
          movingThroughHistory: false,
        };
      });
    };

    // Checking game status
    setGameStatus();

    // Updating history
    updateHistory();

    // Playing sounds
    if (!history.movingThroughHistory) playSound();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const setSound = (sound: typeof emptySound) => {
    soundsRef.current = sound;
  };

  const playSound = () => {
    if (!soundsRef.current) return;

    new Howl({ src: soundsRef.current, preload: true, html5: true }).play();
    soundsRef.current = null;
  };

  const goBackHistory = () => {
    const { curentTurn } = history;
    if (curentTurn - 1 < 0) return;

    const prevTurn = cloneDeep(history.turns[curentTurn - 1]);
    setBoard(prevTurn.board);
    setLostPieces(prevTurn.lostPieces);
    setActivePlayer(prevTurn.activePlayer);
    setSelected(null);
    hidePossibleMoves();
    setPromoting(null);
    setIsChecked(prevTurn.isChecked);
    Pawn.enPassant = prevTurn.enPassant;
    setHistory((prevHistory) => {
      const turns = cloneDeep(prevHistory.turns);
      return { curentTurn: curentTurn - 1, turns, movingThroughHistory: true };
    });
    setSound(moveHistorySound);
    playSound();
  };

  const goForwardHistory = () => {
    const { curentTurn } = history;
    if (curentTurn + 1 >= history.turns.length) return;

    const nextTurn = cloneDeep(history.turns[curentTurn + 1]);
    setBoard(nextTurn.board);
    setLostPieces(nextTurn.lostPieces);
    setActivePlayer(nextTurn.activePlayer);
    setSelected(null);
    hidePossibleMoves();
    setPromoting(null);
    setIsChecked(nextTurn.isChecked);
    Pawn.enPassant = nextTurn.enPassant;
    setHistory((prevHistory) => {
      const turns = cloneDeep(prevHistory.turns);
      return { curentTurn: curentTurn + 1, turns, movingThroughHistory: true };
    });
    if (nextTurn.sound) setSound(nextTurn.sound);
    playSound();
  };

  const restartGame = () => {
    setSound(gameStartSound);

    Pawn.enPassant = null;
    setBoard(initializeBoard());
    setLostPieces({ white: [], black: [] });
    setActivePlayer("white");
    hidePossibleMoves();
    setSelected(null);
    setPromoting(null);
    setIsChecked(false);
    setGameOver({ type: null, show: false });
    const newHistory = cloneDeep(defaultHistory);
    setHistory({
      curentTurn: newHistory.curentTurn,
      turns: newHistory.turns,
      movingThroughHistory: true,
    });
    playSound();
  };

  const hideGameOver = () => {
    setGameOver((prevGameOver) => ({ ...prevGameOver, show: false }));
  };

  const addLostPiece = (lostPiece: Piece) => {
    setLostPieces((prevLostPieces) => {
      const color = lostPiece.color;
      const list = [...prevLostPieces[color]];
      list.push(lostPiece);
      return {
        ...prevLostPieces,
        [color]: list,
      };
    });
  };

  const changeActivePlayer = () => {
    setActivePlayer((prevActivePlayer) => (prevActivePlayer === "white" ? "black" : "white"));
  };

  const selectPiece = (piece: Piece, from: string) => {
    if (gameOver.type) return;
    hidePossibleMoves();
    setSelected({ piece: piece, from: from });
    showPossibleMoves(piece);
  };

  const deselectPiece = () => {
    hidePossibleMoves();
    setSelected(null);
  };

  const showPossibleMoves = (piece: Piece) => {
    setHighlighted((prevHighligted) => ({ ...prevHighligted, cells: piece.showPossibleMoves() }));
  };

  const hidePossibleMoves = () => {
    setHighlighted((prevHighligted) => ({ ...prevHighligted, cells: [] }));
  };

  const togglePossibleMoves = () => {
    setHighlighted((prevHighlighted) => ({ ...prevHighlighted, show: !prevHighlighted.show }));
  };

  const addChangeBoardSound = (lostPiece: Piece | null, hasCastled?: boolean) => {
    setSound(moveSound);
    if (lostPiece) setSound(captureSound);
    if (hasCastled) setSound(castleSound);
  };

  const movePiece = (to: string) => {
    const [toRow] = to.split("");
    const isPawnPromoted =
      selected!.piece.type === "pawn" &&
      (toRow === "0" || toRow === "7") &&
      selected!.piece.validPossibleMoves.includes(to);
    if (isPawnPromoted) {
      if (!selected!.piece.validPossibleMoves.includes(to)) return;
      return startPromotingPawn(selected!.from, to, selected!.piece.color);
    }

    // Changing a board
    const { newBoard, lostPiece, hasCastled } = selected!.piece.move(
      cloneDeep(board),
      selected!.from,
      to
    );
    if (isEqual(newBoard, board)) return;
    setBoard(newBoard);

    // Making sound effect
    addChangeBoardSound(lostPiece, hasCastled);
    console.log(lostPiece);

    // Adding list piece to the list
    if (lostPiece) addLostPiece(lostPiece);

    // Storing pieces possible moves after board changed
    setBoard((prevBoard) => storePiecesPossibleMoves(cloneDeep(prevBoard), activePlayer));

    // Deselect piece after it was moved
    deselectPiece();

    // Change active player
    changeActivePlayer();
  };

  const startPromotingPawn = (from: string, to: string, color: Types.Color) => {
    setPromoting({
      from: from,
      to: to,
      color: color,
    });

    deselectPiece();
  };

  const finishPromotingPawn = (piece: Queen | Rook | Bishop | Knight) => {
    const [fromRow, fromColumn] = promoting!.from.split("");
    const [toRow, toColumn] = promoting!.to.split("");

    // Changing board
    const boardCopy = cloneDeep(board);
    boardCopy[+fromRow][+fromColumn].piece = null;
    // Adding lost piece
    if (boardCopy[+toRow][+toColumn].piece) addLostPiece(boardCopy[+toRow][+toColumn].piece!);
    boardCopy[+toRow][+toColumn].piece = piece;
    setBoard(boardCopy);

    // Storing pieces possible moves
    setBoard((prevBoard) => storePiecesPossibleMoves(cloneDeep(prevBoard), activePlayer));

    // Chanigng active player
    changeActivePlayer();

    // Exiting promoting
    setPromoting(null);
  };

  const cancelPromotingPawn = () => {
    setPromoting(null);
  };

  const contextValue = {
    board,
    activePlayer,
    lostPieces,
    selected,
    highlighted,
    promoting,
    isChecked,
    gameOver,
    goBackHistory,
    goForwardHistory,
    restartGame,
    hideGameOver,
    togglePossibleMoves,
    selectPiece,
    deselectPiece,
    movePiece,
    startPromotingPawn,
    finishPromotingPawn,
    cancelPromotingPawn,
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export default GameContextProvider;
