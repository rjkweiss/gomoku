const API_BASE_URL = '/api';

interface RegisterData {
    email: string;
    username?: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface LoginData {
    emailOrUsername: string;
    password: string;
}

interface GameData {
    aiDepth: number;
    result: 'win' | 'loss' | 'draw';
    moveCount?: number;
    gameDurationSeconds?: number;
}

interface User {
    id: number;
    email: string;
    username: string | null;
    firstName: string;
    lastName: string;
}

interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

interface StatsResponse {
    overall: {
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        highestDepthBeaten: number;
    };
    byDepth: Array<{
        depth: number;
        wins: number;
        losses: number;
        draws: number;
        total: number;
        winRate: number;
    }>;
    recentGames: Array<{
        id: number;
        aiDepth: number;
        result: string;
        moveCount: number | null;
        gameDurationSeconds: number | null;
        playedAt: string;
    }>;
}

class ApiService {
    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Registration failed');
        }

        return result;
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Login failed');
        }

        return result;
    }

    async logout(): Promise<void> {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: this.getAuthHeader()
        });
    }

    // ----------------------------- game endpoints -------------------------//
    async recordGame(data: GameData): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/games/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader()
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to record game')
        }
    }

    // ----------------------------- stats endpoints ---------------------- //
    async getStats(): Promise<StatsResponse> {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            method: 'GET',
            headers: this.getAuthHeader()
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch stats');
        }

        return result;
    }
}

export const api = new ApiService();
export type { User, AuthResponse, StatsResponse, GameData, RegisterData};
