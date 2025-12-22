import './DepthSelector.css';

interface DepthSelectorProps {
    depth: number;
    minDepth?: number;
    maxDepth?: number;
    onDepthChange: (newDepth: number) => void;
    disabled?: boolean;
}

export const DepthSelector = ({
    depth,
    minDepth = 1,
    maxDepth = 7,
    onDepthChange,
    disabled = false
}: DepthSelectorProps) => {
    const handleDecrease = () => {
        if (depth > minDepth) {
            onDepthChange(depth - 1);
        }
    };

    const handleIncrease = () => {
        if (depth < maxDepth) {
            onDepthChange(depth + 1)
        }
    };

    // Get difficulty label based on depth
    const getDifficultyLabel = (d: number): string => {
        if (d <= 2) return "Easy";
        if (d <= 4) return "Medium";
        return "Hard";
    };

    const getDifficultyClass = (d: number): string => {
        if (d <= 2) return "easy";
        if (d <= 4) return "medium";
        return "hard";
    };

    return (
        <div className={`depth-selector-container ${disabled ? 'disabled' : ''}`}>
            <span className='depth-label'>Difficulty Level</span>
            <div className="depth-controls">
                <button
                    className="depth-btn decrease"
                    onClick={handleDecrease}
                    disabled={disabled || depth <= minDepth}
                    aria-label='Decrease difficulty'
                >
                    -
                </button>

                <div className="depth-display">
                    <span className="depth-value">{depth}</span>
                    <span className={`difficulty-label ${getDifficultyClass(depth)}`}>
                        {getDifficultyLabel(depth)}
                    </span>
                </div>

                <button
                    className="depth-btn increase"
                    onClick={handleIncrease}
                    disabled={disabled || depth >= maxDepth}
                    aria-label='Increase difficulty'
                >
                    +
                </button>
            </div>
        </div>
    );
};
