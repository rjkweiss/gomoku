import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { api, type StatsResponse } from "../../services/api";
import './StatsDisplay.css';

export interface StatsDisplayHandle {
    loadStats: () => Promise<void>;
}

export const StatsDisplay = forwardRef<StatsDisplayHandle>((_, ref) => {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const data = await api.getStats();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    };

    // Expose loadStats to parent via ref
    useImperativeHandle(ref, () => ({
        loadStats
    }));

    useEffect(() => {
        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-loading">Loading stats...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-error">{error}</div>
                <button
                    className="stats-retry-btn"
                    onClick={loadStats}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!stats || stats.overall.totalGames === 0) {
        return (
            <div className="stats-container">
                <h3 className="stats-title">Your Statistics</h3>
                <div className="stats-empty">
                    No games played yet. Start playing to see your stats!
                </div>
            </div>
        );
    }

    const getDifficultyLabel = (depth: number): string => {
        if (depth <= 2) return 'Easy';
        if (depth <= 4) return 'Medium';
        return 'Hard';
    };

    const getDifficultyClass = (depth: number): string => {
        if (depth <= 2) return 'easy';
        if (depth <= 4) return 'medium';
        return 'hard';
    };

    return (
        <div className="stats-container">
            <h3 className="stats-title">Your Statistics</h3>

            {/* Overall Stats */}
            <div className="stats-section">
                <h4 className="stats-section-title">Overall</h4>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{stats.overall.totalGames}</div>
                        <div className="stat-label">Games</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value stat-wins">{stats.overall.wins}</div>
                        <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value state-losses">{stats.overall.losses}</div>
                        <div className="stat-label">Losses</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.overall.draws}</div>
                        <div className="stat-label">Draws</div>
                    </div>
                </div>
                <div className="win-rate-bar">
                    <div className="win-rate-label">Win Rate: {stats.overall.winRate}%</div>
                    <div className="win-rate-progress">
                        <div
                            className="win-rate-fill"
                            style={{ width: `${stats.overall.winRate}%` }}
                        />
                    </div>
                </div>
                {stats.overall.highestDepthBeaten > 0 && (
                    <div className="highest-depth">
                        <span className="highest-depth-label">Highest Difficulty Beaten: </span>
                        <span className={`difficulty-badge ${getDifficultyClass(stats.overall.highestDepthBeaten)}`}>
                            {getDifficultyLabel(stats.overall.highestDepthBeaten)} (Depth {stats.overall.highestDepthBeaten})
                        </span>
                    </div>
                )}
            </div>

            {/* Stats by depth */}
            {stats.byDepth.length > 0 && (
                <div className="stats-section">
                    <h4 className="stats-section-title">Performance by Difficulty</h4>
                    <div className="depth-stats-list">
                        {stats.byDepth.map((depthStat) => (
                            <div key={depthStat.depth} className="depth-stat-item">
                                <div className="depth-stat-header">
                                    <span className={`difficulty-badge ${getDifficultyClass(depthStat.depth)}`}>
                                        {getDifficultyLabel(depthStat.depth)} (Depth {depthStat.depth})
                                    </span>
                                    <span className="depth-win-rate">{depthStat.winRate}%</span>
                                </div>
                                <div className="depth-stat-details">
                                    <span className="depth-stat-text">
                                        {depthStat.wins}W - {depthStat.losses}L - {depthStat.draws}D
                                    </span>
                                    <div className="depth-stat-total">({depthStat.total} games)</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
