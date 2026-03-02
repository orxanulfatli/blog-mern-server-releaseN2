"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' },
    title: {
        type: String,
        require: true,
        trim: true,
        minLength: 10,
        maxLength: 50
    },
    content: {
        type: String,
        require: true,
        minLength: 2000
    },
    description: {
        type: String,
        require: true,
        trim: true,
        minLength: 50,
        maxLength: 200
    },
    thumbnail: {
        type: String,
        require: true
    },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'category' }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)('blog', blogSchema);
