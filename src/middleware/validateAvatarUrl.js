/**
 * Validates the avatar_url field in the request body.
 * @param {import('express').Request} req Request object
 * @param {import('express').Response} res Response object
 * @param {import('express').NextFunction} next Next middleware
 */
export default function validateAvatarUrlMiddleware(req, res, next) {
    if (req.body && 'avatar_url' in req.body && typeof req.body.avatar_url === 'string') {
        const forbiddenRegExp = /[\x00/\\]/;
        if (forbiddenRegExp.test(req.body.avatar_url)) {
            console.error('An error occurred while validating the avatar_url field', {
                handle: req.user.profile.handle,
                path: req.path,
                avatar_url: req.body.avatar_url,
            });
            return res.sendStatus(400);
        }
    }

    next();
}
