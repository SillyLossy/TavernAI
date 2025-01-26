import mongoose from 'mongoose';
import { squareCharacterStatus, getSquareCharacterStatusValues } from '../interfaces/squareCharacter.js';

const extensionsSchema = new mongoose.Schema({
    talkativeness: {
        type: String,
        default: '1',
    },
    fav: {
        type: Boolean,
        default: false,
    },
    world: {
        type: String,
        default: '',
    },
    depth_prompt: {
        type: {
            prompt: {
                type: String,
                default: '',
            },
            depth: {
                type: Number,
                default: 0,
            },
            role: {
                type: String,
                default: 'system',
            },
        },
        default: () => ({}),
        _id: false,
    },
    group_greetings_mode: {
        type: Number,
        default: 0,
    },
    group_greetings: {
        type: [String],
        default: [],
    },
}, { _id: false });

const characterDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    personality: {
        type: String,
        default: '',
    },
    scenario: {
        type: String,
        default: '',
    },
    first_mes: {
        type: String,
        default: '',
    },
    mes_example: {
        type: String,
        default: '',
    },
    creator_notes: {
        type: String,
        default: '',
    },
    system_prompt: {
        type: String,
        default: '',
    },
    post_history_instructions: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    creator: {
        type: String,
        default: '',
    },
    character_version: {
        type: String,
        default: '',
    },
    alternate_greetings: {
        type: [String],
        default: [],
    },
    extensions: {
        type: extensionsSchema,
        default: () => ({}),
    },
    group_only_greetings: {
        type: [String],
        default: [],
    },
}, { _id: false });

const squareCharacterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    creatorcomment: {
        type: String,
        default: '',
    },
    personality: {
        type: String,
        default: '',
    },
    first_mes: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    mes_example: {
        type: String,
        default: '',
    },
    scenario: {
        type: String,
        default: '',
    },
    create_date: {
        type: String,
        default: () => new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            fractionalSecondDigits: 3,
        }).replace(/,/g, '').replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
    },
    talkativeness: {
        type: String,
        default: '1',
    },
    creator: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    fav: {
        type: Boolean,
        default: false,
    },
    spec: {
        type: String,
        default: 'chara_card_v3',
    },
    spec_version: {
        type: String,
        default: '3.0',
    },
    data: {
        type: characterDataSchema,
        default: () => ({}),
    },
    json_data: {
        type: String,
        default: '',
    },
    date_added: {
        type: Number,
        default: () => Date.now(),
    },
    hash: {
        type: String,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: getSquareCharacterStatusValues(),
        default: squareCharacterStatus.PENDING,
        required: true,
    },
}, {
    timestamps: true,
});

// 更新时自动更新 updatedAt 字段
squareCharacterSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const SquareCharacter = mongoose.model('SquareCharacter', squareCharacterSchema);
