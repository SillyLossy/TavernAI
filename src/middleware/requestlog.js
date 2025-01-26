import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(__dirname, '../../access.log');

const MAX_BODY_LENGTH = 1000; // 最大显示长度
const MAX_LOG_LENGTH = 3000; // 整条日志最大长度

/**
 * 截断长文本
 * @param {any} obj 需要截断的对象
 * @returns {any} 截断后的对象
 */
function truncateBody(obj) {
    if (typeof obj === 'string') {
        return obj.length > MAX_BODY_LENGTH ? obj.slice(0, MAX_BODY_LENGTH) + '...' : obj;
    }
    if (typeof obj === 'object' && obj !== null) {
        const truncated = {};
        for (const [key, value] of Object.entries(obj)) {
            truncated[key] = truncateBody(value);
        }
        return truncated;
    }
    return obj;
}

/**
 * 截断整条日志
 * @param {string} log 日志文本
 * @returns {string} 截断后的日志
 */
function truncateLog(log) {
    if (log.length > MAX_LOG_LENGTH) {
        return log.slice(0, MAX_LOG_LENGTH) + '... (truncated)';
    }
    return log;
}

/**
 * 记录请求和响应日志的中间件
 * @param {import('express').Request} request 请求对象
 * @param {import('express').Response} response 响应对象
 * @param {import('express').NextFunction} next 下一个中间件
 */
function requestlogMiddleware(request, response, next) {
    // 忽略健康检查接口
    if (request.path === '/health') {
        return next();
    }

    const startTime = Date.now();
    const { method, path: routePath, ip } = request;

    // 准备请求信息
    let requestData = '';
    if (request.query && Object.keys(request.query).length > 0) {
        requestData += ` Query: ${JSON.stringify(truncateBody(request.query))}`;
    }
    if (request.body && Object.keys(request.body).length > 0) {
        requestData += ` reqBody: ${JSON.stringify(truncateBody(request.body))}`;
    }

    // 捕获响应
    const originalSend = response.send;
    response.send = function (data) {
        response.responseBody = data;
        return originalSend.apply(response, arguments);
    };

    // 捕获响应完成事件
    response.on('finish', () => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        // 准备响应信息
        let responseData = '';
        if (response.responseBody) {
            let responseBody = response.responseBody;
            try {
                if (typeof responseBody === 'string') {
                    responseBody = JSON.parse(responseBody);
                }
                responseData = ` respBody: ${JSON.stringify(truncateBody(responseBody))}`;
            } catch (e) {
                responseData = ` respBody: ${truncateBody(String(responseBody))}`;
            }
        }

        // 在控制台打印彩色日志
        let statusColor = '\x1b[32m'; // 绿色 - 成功响应
        if (statusCode >= 400) {
            statusColor = '\x1b[31m'; // 红色 - 错误响应
        } else if (statusCode >= 300) {
            statusColor = '\x1b[33m'; // 黄色 - 重定向
        }

        // 构建完整日志
        const fullLog = `\x1b[90m${new Date().toISOString()}\x1b[0m [${ip}] ${method} ${routePath} ${statusColor}${statusCode}\x1b[0m (${duration}ms)${requestData}${responseData}`;

        // 打印截断后的日志
        console.log(truncateLog(fullLog));

        // 写入日志文件
        const logEntry = `[${new Date().toISOString()}] ${method} ${routePath} - ${statusCode} ${duration}ms (${ip})\n`;
        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error('写入日志文件失败:', err);
            }
        });
    });

    next();
}

export { requestlogMiddleware };

