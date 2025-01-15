import path from 'node:path';
import { promises as fsPromises } from 'node:fs';
import crypto from 'node:crypto';

import storage from 'node-persist';
import express from 'express';

import { jsonParser } from '../express-common.js';
import { getUserAvatar, toKey, getPasswordHash, getPasswordSalt, createBackupArchive, ensurePublicDirectoriesExist, toAvatarKey } from '../users.js';
import { SETTINGS_FILE } from '../constants.js';
import { checkForNewContent, CONTENT_TYPES } from './content-manager.js';
import { color, Cache, logInfo, logError } from '../util.js';

const RESET_CACHE = new Cache(5 * 60 * 1000);

export const router = express.Router();

router.post('/logout', async (request, response) => {
    try {
        if (!request.session) {
            logError('Session not available');
            return response.sendStatus(500);
        }

        request.session.handle = null;
        request.session = null;
        return response.sendStatus(204);
    } catch (error) {
        logError(error);
        return response.sendStatus(500);
    }
});

router.get('/me', async (request, response) => {
    try {
        if (!request.user) {
            return response.sendStatus(403);
        }

        const user = request.user.profile;
        const viewModel = {
            handle: user.handle,
            name: user.name,
            avatar: await getUserAvatar(user.handle),
            admin: user.admin,
            password: !!user.password,
            created: user.created,
        };

        return response.json(viewModel);
    } catch (error) {
        logError(error);
        return response.sendStatus(500);
    }
});

router.post('/change-avatar', jsonParser, async (request, response) => {
    try {
        if (!request.body.handle) {
            logError('Change avatar failed: Missing required fields');
            return response.status(400).json({ error: 'Missing required fields' });
        }

        if (request.body.handle !== request.user.profile.handle && !request.user.profile.admin) {
            logError('Change avatar failed: Unauthorized');
            return response.status(403).json({ error: 'Unauthorized' });
        }

        // Avatar is not a data URL or not an empty string
        if (!request.body.avatar.startsWith('data:image/') && request.body.avatar !== '') {
            logError('Change avatar failed: Invalid data URL');
            return response.status(400).json({ error: 'Invalid data URL' });
        }

        /** @type {import('../users.js').User} */
        const user = await storage.getItem(toKey(request.body.handle));

        if (!user) {
            logError('Change avatar failed: User not found');
            return response.status(404).json({ error: 'User not found' });
        }

        await storage.setItem(toAvatarKey(request.body.handle), request.body.avatar);

        return response.sendStatus(204);
    } catch (error) {
        logError(error);
        return response.sendStatus(500);
    }
});

router.post('/change-password', jsonParser, async (request, response) => {
    try {
        if (!request.body.handle) {
            logError('Change password failed: Missing required fields');
            return response.status(400).json({ error: 'Missing required fields' });
        }

        if (request.body.handle !== request.user.profile.handle && !request.user.profile.admin) {
            logError('Change password failed: Unauthorized');
            return response.status(403).json({ error: 'Unauthorized' });
        }

        /** @type {import('../users.js').User} */
        const user = await storage.getItem(toKey(request.body.handle));

        if (!user) {
            logError('Change password failed: User not found');
            return response.status(404).json({ error: 'User not found' });
        }

        if (!user.enabled) {
            logError('Change password failed: User is disabled');
            return response.status(403).json({ error: 'User is disabled' });
        }

        if (!request.user.profile.admin && user.password && user.password !== getPasswordHash(request.body.oldPassword, user.salt)) {
            logError('Change password failed: Incorrect password');
            return response.status(403).json({ error: 'Incorrect password' });
        }

        if (request.body.newPassword) {
            const salt = getPasswordSalt();
            user.password = getPasswordHash(request.body.newPassword, salt);
            user.salt = salt;
        } else {
            user.password = '';
            user.salt = '';
        }

        await storage.setItem(toKey(request.body.handle), user);
        return response.sendStatus(204);
    } catch (error) {
        logError(error);
        return response.sendStatus(500);
    }
});

router.post('/backup', jsonParser, async (request, response) => {
    try {
        const handle = request.body.handle;

        if (!handle) {
            logError('Backup failed: Missing required fields');
            return response.status(400).json({ error: 'Missing required fields' });
        }

        if (handle !== request.user.profile.handle && !request.user.profile.admin) {
            logError('Backup failed: Unauthorized');
            return response.status(403).json({ error: 'Unauthorized' });
        }

        await createBackupArchive(handle, response);
    } catch (error) {
        logError('Backup failed', error);
        return response.sendStatus(500);
    }
});

router.post('/reset-settings', jsonParser, async (request, response) => {
    try {
        const password = request.body.password;

        if (request.user.profile.password && request.user.profile.password !== getPasswordHash(password, request.user.profile.salt)) {
            logError('Reset settings failed: Incorrect password');
            return response.status(403).json({ error: 'Incorrect password' });
        }

        const pathToFile = path.join(request.user.directories.root, SETTINGS_FILE);
        await fsPromises.rm(pathToFile, { force: true });
        await checkForNewContent([request.user.directories], [CONTENT_TYPES.SETTINGS]);

        return response.sendStatus(204);
    } catch (error) {
        logError('Reset settings failed', error);
        return response.sendStatus(500);
    }
});

router.post('/change-name', jsonParser, async (request, response) => {
    try {
        if (!request.body.name || !request.body.handle) {
            logError('Change name failed: Missing required fields');
            return response.status(400).json({ error: 'Missing required fields' });
        }

        if (request.body.handle !== request.user.profile.handle && !request.user.profile.admin) {
            logError('Change name failed: Unauthorized');
            return response.status(403).json({ error: 'Unauthorized' });
        }

        /** @type {import('../users.js').User} */
        const user = await storage.getItem(toKey(request.body.handle));

        if (!user) {
            logError('Change name failed: User not found');
            return response.status(404).json({ error: 'User not found' });
        }

        user.name = request.body.name;
        await storage.setItem(toKey(request.body.handle), user);

        return response.sendStatus(204);
    } catch (error) {
        logError('Change name failed', error);
        return response.sendStatus(500);
    }
});

router.post('/reset-step1', jsonParser, async (request, response) => {
    try {
        const resetCode = String(crypto.randomInt(1000, 9999));
        logInfo();
        logInfo(color.magenta(`${request.user.profile.name}, your account reset code is: `) + color.red(resetCode));
        logInfo();
        RESET_CACHE.set(request.user.profile.handle, resetCode);
        return response.sendStatus(204);
    } catch (error) {
        logError('Recover step 1 failed:', error);
        return response.sendStatus(500);
    }
});

router.post('/reset-step2', jsonParser, async (request, response) => {
    try {
        if (!request.body.code) {
            logError('Recover step 2 failed: Missing required fields');
            return response.status(400).json({ error: 'Missing required fields' });
        }

        if (request.user.profile.password && request.user.profile.password !== getPasswordHash(request.body.password, request.user.profile.salt)) {
            logError('Recover step 2 failed: Incorrect password');
            return response.status(400).json({ error: 'Incorrect password' });
        }

        const code = RESET_CACHE.get(request.user.profile.handle);

        if (!code || code !== request.body.code) {
            logError('Recover step 2 failed: Incorrect code');
            return response.status(400).json({ error: 'Incorrect code' });
        }

        logInfo('Resetting account data:', request.user.profile.handle);
        await fsPromises.rm(request.user.directories.root, { recursive: true, force: true });

        await ensurePublicDirectoriesExist();
        await checkForNewContent([request.user.directories]);

        RESET_CACHE.remove(request.user.profile.handle);
        return response.sendStatus(204);
    } catch (error) {
        logError('Recover step 2 failed:', error);
        return response.sendStatus(500);
    }
});
