"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'user' },
    blog_id: mongoose_1.Types.ObjectId,
    blog_user_id: mongoose_1.Types.ObjectId,
    content: { type: String, required: true },
    replyCM: [{ type: mongoose_1.Types.ObjectId, ref: 'comment' }],
    reply_user: { type: mongoose_1.Types.ObjectId, ref: 'user' },
    comment_root: { type: mongoose_1.Types.ObjectId, ref: 'comment' }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)('comment', commentSchema);
