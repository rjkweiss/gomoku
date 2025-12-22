import { useCallback, useRef, useState } from "react";
import { Board } from "../game_logic/Board";
import { AIPlayer } from "../game_logic/AIPlayer";
import type { BoardState, GameStatus, PositionOrNull, StoneColor, Winner } from "../types/Types";

// Configuration interface
interface GameConfig {
    boardSize: number;
    cellSize: number;
    margin: number;
    aiDepth: number;
    aiDelayMs: number;
}

// Return type for the hook
interface GameStateReturn {
    boardState: BoardState;
    currentTurn: StoneColor;
    gameStatus: GameStatus;
    winner: Winner;
    isAIThinking: boolean;
    handleIntersectionClick: (row: number, col: number) => void;
    resetGame: () => void;
    convertPixelToCoords: (xPixel: number, yPixel: number) => PositionOrNull;
    // config for board view
    boardSize: number;
    cellSize: number;
    margin: number;
}

const HUMAN_PLAYER: StoneColor = "B";
const AI_PLAYER: StoneColor = "W";

export const useGameState = (config: GameConfig): GameStateReturn => {
    const { boardSize, cellSize, margin, aiDepth, aiDelayMs } = config;

    // Refs for mutable game logic instances
    const boardRef = useRef<Board>(new Board(boardSize, cellSize, margin));
    const aiPlayerRef = useRef<AIPlayer>(new AIPlayer(boardRef.current, aiDepth));

    // State that triggers re-renders
    const [boardState, setBoardState] = useState<BoardState>(boardRef.current.board);
    const [currentTurn, setCurrentTurn] = useState<StoneColor>(HUMAN_PLAYER);
    const [gameStatus, setGameStatus] = useState<GameStatus>("Playing");
    const [winner, setWinner] = useState<Winner>(null);
    const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

    // Sync board state for rendering
    const updateBoardState = useCallback(() => {
        // Create new array reference to trigger React re-render
        setBoardState(boardRef.current.board.map(row => [...row]));
    }, []);

    // Process AI move
    const makeAIMove = useCallback(() => {
        const aiMove = aiPlayerRef.current.findBestMove();

        if (!aiMove) {
            // no valid moves -- handle with grace
            setIsAIThinking(false);
            return;
        }

        const [row, col] = aiMove;

        // Place AI Stone
        boardRef.current.makeMove(row, col, AI_PLAYER);
        updateBoardState();

        // Check for AI win
        if (boardRef.current.checkWin(row, col)) {
            setGameStatus("Won");
            setWinner(AI_PLAYER);
            setIsAIThinking(false);
            return;
        }

        // Check for draw
        if (boardRef.current.isBoardFull()) {
            setGameStatus("Draw");
            setIsAIThinking(false);
            return;
        }

        // Switch back to Human
        setCurrentTurn(HUMAN_PLAYER);
        setIsAIThinking(false);

    }, [updateBoardState]);

    // Handle human player clicks
    const handleIntersectionClick = useCallback((row: number, col: number) => {
        // Ignore if not human player's turn or is game over
        if (currentTurn !== HUMAN_PLAYER || gameStatus !== "Playing" || isAIThinking) {
            return;
        }

        // check if position is valid
        if (!boardRef.current.isValidPosition(row, col)) return;

        // Place stone
        boardRef.current.makeMove(row, col, HUMAN_PLAYER);
        updateBoardState();

        // Check if human won
        if (boardRef.current.checkWin(row, col)) {
            setGameStatus("Won");
            setWinner(HUMAN_PLAYER);
            return;
        }

        // Check Draw
        if (boardRef.current.isBoardFull()) {
            setGameStatus("Draw");
            return;
        }

        // switch to AI
        setCurrentTurn(AI_PLAYER);
        setIsAIThinking(true);

        // AI moves after some delay (thinking time for natural behavior)
        setTimeout(() => {
            makeAIMove();
        }, aiDelayMs);
    }, [currentTurn, gameStatus, isAIThinking, aiDelayMs, updateBoardState, makeAIMove]);

    // Reset game to initial state
    const resetGame = useCallback(() => {
        // Create fresh instances
        boardRef.current = new Board(boardSize, cellSize, margin);
        aiPlayerRef.current = new AIPlayer(boardRef.current, aiDepth);

        // Reset all states
        setBoardState(boardRef.current.board.map(row => [...row]));
        setCurrentTurn(HUMAN_PLAYER);
        setGameStatus("Playing");
        setWinner(null);
        setIsAIThinking(false);

    }, [boardSize, cellSize, margin, aiDepth]);

    // Pass through for pixel conversion
    const convertPixelToCoords = useCallback((xPixel: number, yPixel: number): PositionOrNull => {
        return boardRef.current.convertPixelCoordsToBoard(xPixel, yPixel);
    }, []);

    return {
        boardState,
        currentTurn,
        gameStatus,
        winner,
        isAIThinking,
        handleIntersectionClick,
        resetGame,
        convertPixelToCoords,
        boardSize,
        cellSize,
        margin
    };
};
