import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../../lib/cors.js';

const handler = async (req: VercelRequest, res: VercelResponse) => {
    if (handleCors(req, res)) return;

    // only allow POST calls
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'method not allowed'
        });
    }
    //  With JWT, logout is handled client-side by removing the token
    // Endpoint is just for consistency / any future enhancement e.g. token blacklisting, clearing HTTP-only cookies, etc

    return res.status(200).json({
        message: 'Logged out successfully'
    });

};

export default handler;
