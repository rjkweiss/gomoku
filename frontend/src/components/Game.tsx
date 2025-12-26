import { useEffect, useRef } from "react";
import { useGameState } from "../hooks/useGameState";
import { BoardView } from "./board/BoardView";
import { GameInfo } from "./gameInfo/GameInfo";
import { GameOverlay } from "./gameOverlay/GameOverlay";
import { Layout } from "./layout/Layout";
import { DepthSelector } from "./depthSelector/DepthSelector";
import { UserProfile } from "./userProfile/UserProfile";
import { StatsDisplay, type StatsDisplayHandle } from "./stats/StatsDisplay";
import { api } from "../services/api";
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

    // Track if game result has been recorded
    const gameRecordedRef = useRef(false);
    const StatsDisplayRef = useRef<StatsDisplayHandle | null>(null);

    // Record game result when game ends
    useEffect(() => {
        const recordGameResult = async () => {
            if (gameStatus !== 'Playing' && !gameRecordedRef.current) {
                gameRecordedRef.current = true;

                try {
                    let result: 'win' | 'loss' | 'draw';
                    if (gameStatus === 'Draw') {
                        result = 'draw';
                    } else if (winner === 'B') {
                        result = 'win';
                    } else {
                        result = 'loss';
                    }

                    await api.recordGame({
                        aiDepth,
                        result

                        // LATER: add movesCount, gameDurationSeconds
                    });

                    // Reload stats after recording
                    if (StatsDisplayRef.current) {
                        StatsDisplayRef.current.loadStats();
                    }
                } catch (error) {
                    console.error('Failed to record game: ', error);
                }
            }
        };
        recordGameResult();
    }, [gameStatus, winner, aiDepth]);

    // Handle depth change - resets the game with new depth
    const handleDepthChange = (newDepth: number) => {
        setAIDepth(newDepth);
        resetGame();
        gameRecordedRef.current = false;
    };

    // Handle game reset
    const handleReset = () => {
        resetGame();
        gameRecordedRef.current = false;
    };

    // Sidebar content
    const sidebarContent = (
        <>
        <StatsDisplay ref={StatsDisplayRef} />
        <UserProfile />
        </>
    );

    return (
        <Layout sidebarContent={sidebarContent}>
            <div className="game-container">
                {/* controls above board */}
                <div className="game-controls">
                    <GameInfo
                        currentTurn={currentTurn}
                        isAIThinking={isAIThinking}
                        onReset={handleReset}
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
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};
