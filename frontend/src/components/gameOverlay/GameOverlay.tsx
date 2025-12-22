import type { GameStatus, Winner } from "../../types/Types";
import './GameOverlay.css';

interface GameOverlayProps {
    winner: Winner;
    gameStatus: GameStatus;
    onReset: () => void;
}

export const GameOverlay = ({ winner, gameStatus, onReset}: GameOverlayProps) => {
    // Determine Message
    let message: string;
    if (gameStatus === "Draw") {
        message = "IT'S A DRAW!";
    } else if (winner === "B") {
        message = "YOU WIN!";
    } else {
        message = "AI WINS!";
    }

    return (
        <div
            className="game-overlay-container"
        >
            {/* Message */}
            <span className="overlay-message">{message}</span>

            {/* Play Again Button */}
            <button
                className="play-again-btn"
                onClick={onReset}
            >
                Play Again
            </button>
        </div>
    );
};
