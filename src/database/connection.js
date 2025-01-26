import mongoose from 'mongoose';
import { getConfigValue } from '../util.js';

export async function connectDB() {
    try {
        await mongoose.connect(getConfigValue('database.url'));
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error.stack);
        process.exit(1);
    }
}
