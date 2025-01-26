import express from 'express';
import { SquareCharacter } from '../models/squareCharacter.js';
import { squareCharacterStatus } from '../interfaces/squareCharacter.js';
import { processCharacter } from './characters.js';
import { jsonParser } from '../express-common.js';
import sanitize from 'sanitize-filename';

const router = express.Router();

/**
 * Get character list with pagination
 */
router.get('/character', async (request, response) => {
    try {
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 10;
        const skip = (page - 1) * limit;

        const characters = await SquareCharacter.find({
            // status: squareCharacterStatus.ACTIVE,
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await SquareCharacter.countDocuments({
            // status: squareCharacterStatus.ACTIVE,
        });

        response.json({
            data: characters,
            pagination: {
                current: page,
                pageSize: limit,
                total,
            },
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
    }
});

/**
 * Get character details
 */
router.post('/character/get', jsonParser, async (request, response) => {
    try {
        if (!request.body?.avatar_url) {
            return response.status(400).json({ error: 'Missing required parameters' });
        }

        const character = await SquareCharacter.findOne({
            avatar: request.body.avatar_url,
            // creator: request.user?.username || 'anonymous',
        });

        if (!character) {
            return response.status(404).json({ error: 'Character not found' });
        }

        response.json(character);
    } catch (error) {
        console.error('Failed to get character:', error);
        response.status(500).json({ error: 'Failed to get character data' });
    }
});

/**
 * Delete character softly
 */
router.post('/character/delete', jsonParser, async function (request, response) {
    try {
        if (!request.body?.avatar_url) {
            return response.status(400).json({ error: 'Missing required parameters' });
        }

        if (request.body.avatar_url !== sanitize(request.body.avatar_url)) {
            console.error('Malicious filename prevented');
            return response.status(403).json({ error: 'Invalid filename' });
        }

        const character = await SquareCharacter.findOne({
            avatar: request.body.avatar_url,
            // creator: request.user?.username || 'anonymous',
        });

        if (!character) {
            return response.status(404).json({ error: 'Character not found' });
        }

        // Update status to inactive
        character.status = squareCharacterStatus.INACTIVE;
        await character.save();

        response.json({ message: 'Character deactivated successfully' });
    } catch (error) {
        console.error('Failed to delete character:', error);
        response.status(500).json({ error: 'Failed to delete character' });
    }
});

/**
 * Import character
 */
router.post('/character/import', jsonParser, async (request, response) => {
    try {
        const character = new SquareCharacter({
            ...request.body,
            creator: request.user?.username || 'anonymous',
        });
        await character.save();
        response.status(201).json(character);
    } catch (error) {
        console.error(error);
        response.status(400).json({ error: error.message });
    }
});

/**
 * Publish character to square
 */
router.post('/character/publish', jsonParser, async (request, response) => {
    try {
        if (!request.body?.avatar_url) {
            return response.status(400).json({ error: 'Missing required parameters' });
        }

        // Get character data
        const characterData = await processCharacter(request.body.avatar_url, request.user.directories);

        if (!characterData?.name) {
            return response.status(404).json({ error: 'Character not found or invalid data' });
        }

        // Check if already exists
        const existingCharacter = await SquareCharacter.findOne({
            name: characterData.name,
            creator: request.user?.username || 'anonymous',
        });

        if (existingCharacter) {
            return response.status(409).json({ error: `Character (${characterData.name}) already exists` });
        }

        // Create new square character record
        const squareCharacter = new SquareCharacter({
            ...characterData,
            creator: request.user?.username || 'anonymous',
            status: squareCharacterStatus.PENDING,
        });

        await squareCharacter.save();

        response.status(201).json({
            message: 'Published successfully, pending review',
            data: squareCharacter,
        });
    } catch (error) {
        console.error('Failed to publish character:', error);
        response.status(500).json({ error: 'Failed to publish' });
    }
});

export { router };
