import { useGameState } from "../hooks/useGameState";
import { BoardView } from "./board/BoardView";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import { Layout } from "./layout/Layout";
import { DepthSelector } from "./depthSelector/DepthSelector";

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
        aiDepth,
        handleIntersectionClick,
        resetGame,
        setAIDepth,
        convertPixelToCoords,
        boardSize,
        cellSize,
        margin
    } = useGameState(GAME_CONFIG);

    // Handle depth change - resets the game with new depth
    const handleDepthChange = (newDepth: number) => {
        setAIDepth(newDepth);
        resetGame();
    };

    return (
        <Layout>
            <div className="game-container">
                {/* controls above board */}
                <div className="game-controls">
                    <GameInfo
                        currentTurn={currentTurn}
                        isAIThinking={isAIThinking}
                        onReset={resetGame}
                    />
                    <DepthSelector
                        depth={aiDepth}
                        minDepth={1}
                        maxDepth={7}
                        onDepthChange={handleDepthChange}
                        disabled={isAIThinking}
                    />
                </div>

                {/* Board */}

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
        </Layout>
    );
};
