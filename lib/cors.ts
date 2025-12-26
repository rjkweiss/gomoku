import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCorsHeaders(res: VercelResponse): void {
    const origin = 'http://localhost:5173';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}
