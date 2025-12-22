import { useGameState } from "../hooks/useGameState";
import { BoardView } from "./board/BoardView";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import './Game.css';

// Game Configuration
const GAME_CONFIG = {
    boardSize: 15,
    cellSize: 50,
    margin: 50,
    aiDepth: 3,
    aiDelayMs: 2000
};

export const Game = () => {
    const {
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
    } = useGameState(GAME_CONFIG);

    return (
        <div className="game-container">
            {/* Game Info */}
            <GameInfo
                currentTurn={currentTurn}
                isAIThinking={isAIThinking}
                onReset={resetGame}
            />

            {/* Render Game */}
            <div className="board-wrapper">
                <BoardView
                    board={boardState}
                    boardSize={boardSize}
                    cellSize={cellSize}
                    margin={margin}
                    onIntersectionClick={handleIntersectionClick}
                    convertPixelToCoords={convertPixelToCoords}
                    disabled={isAIThinking || gameStatus !== "Playing"}
                />

                {gameStatus !== "Playing" && (
                    <GameOverlay
                        winner={winner}
                        gameStatus={gameStatus}
                        onReset={resetGame}
                    />
                )}
            </div>
        </div>
    );
};
