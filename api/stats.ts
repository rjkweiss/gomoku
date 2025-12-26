
import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../lib/auth.js';
import { handleCors } from '../lib/cors.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
    if (handleCors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token);

        if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get overall stats
        const allGames = await prisma.gameResult.findMany({
            where: { userId: payload.userId }
        });

        const overallStats = {
            totalGames: allGames.length,
            wins: allGames.filter(g => g.result === 'win').length,
            losses: allGames.filter(g => g.result === 'loss').length,
            draws: allGames.filter(g => g.result === 'draw').length
        };

        // Get stats by depth
        const statsByDepth: Record<number, { wins: number; losses: number; draws: number; total: number }> = {};

        for (const game of allGames) {
            if (!statsByDepth[game.aiDepth]) {
                statsByDepth[game.aiDepth] = { wins: 0, losses: 0, draws: 0, total: 0 };
            }

            statsByDepth[game.aiDepth].total++;

            if (game.result === 'win') {
                statsByDepth[game.aiDepth].wins++;
            } else if (game.result === 'loss') {
                statsByDepth[game.aiDepth].losses++;
            } else {
                statsByDepth[game.aiDepth].draws++;
            }
        }

        // Calculate win rate and format by depth
        const byDepth = Object.entries(statsByDepth).map(([depth, stats]) => ({
            depth: parseInt(depth),
            ...stats,
            winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0
        })).sort((a, b) => a.depth - b.depth);

        // Find highest depth beaten
        const highestDepthBeaten = allGames
            .filter(g => g.result === 'win')
            .reduce((max, g) => Math.max(max, g.aiDepth), 0);

        // Get recent games
        const recentGames = await prisma.gameResult.findMany({
            where: { userId: payload.userId },
            orderBy: { playedAt: 'desc' },
            take: 10
        });

        return res.status(200).json({
            overall: {
                ...overallStats,
                winRate: overallStats.totalGames > 0
                    ? Math.round((overallStats.wins / overallStats.totalGames) * 100)
                    : 0,
                highestDepthBeaten
            },
            byDepth,
            recentGames
        });

    } catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default handler;
