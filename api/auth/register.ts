import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma.js';
import { createToken } from '../../lib/auth.js';
import { handleCors } from '../../lib/cors.js';


const SALT_ROUNDS = 10;


const handler = async (req: VercelRequest, res: VercelResponse) => {
    if (handleCors(req, res)) return;

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, username, password, firstName, lastName } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Missing required fields: email, password, firstName, lastName'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Validate password strength (minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters'
            });
        }

        // Check if email already exist
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }

        // Check if username already exist (if provided)
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUsername) {
                return res.status(409).json({
                    error: 'Username already taken'
                });
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username: username || null,
                passwordHash,
                firstName,
                lastName
            }
        });

        // create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email
        });

        // Return success with token
        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            },
            token
        });
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default handler;
