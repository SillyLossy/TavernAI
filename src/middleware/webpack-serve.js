import path from 'node:path';
import webpack from 'webpack';
import { publicLibConfig } from '../../webpack.config.js';

export default function getWebpackServeMiddleware() {
    const outputPath = publicLibConfig.output?.path;
    const outputFile = publicLibConfig.output?.filename;

    /**
     * A very spartan recreation of webpack-dev-middleware.
     * @param {import('express').Request} req Request object.
     * @param {import('express').Response} res Response object.
     * @param {import('express').NextFunction} next Next function.
     * @type {import('express').RequestHandler}
     */
    function devMiddleware(req, res, next) {
        if (req.method === 'GET' && path.parse(req.path).base === outputFile) {
            return res.sendFile(outputFile, { root: outputPath });
        }

        next();
    }

    /**
     * Wait until Webpack is done compiling.
     * @returns {Promise<void>}
     */
    devMiddleware.runWebpackCompiler = () => {
        const compiler = webpack(publicLibConfig);

        return new Promise((resolve) => {
            console.log();
            console.log('Compiling frontend libraries...');
            compiler.run((_error, stats) => {
                const output = stats?.toString(publicLibConfig.stats);
                if (output) {
                    console.log(output);
                    console.log();
                }
                compiler.close(() => {
                    resolve();
                });
            });
        });
    };

    return devMiddleware;
}
