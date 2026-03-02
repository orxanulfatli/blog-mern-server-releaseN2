"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiErrors_1 = require("../utils/apiErrors");
const commentModel_1 = __importDefault(require("../models/commentModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../index");
const Pagination = (req) => {
    let page = Number(req.query.page) * 1 || 1;
    let limit = Number(req.query.limit) * 1 || 4;
    let skip = (page - 1) * limit;
    return { page, limit, skip };
};
class CommentController {
    constructor() {
        this.createComment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const { content, blog_id, blog_user_id } = req.body;
                const newComment = new commentModel_1.default({
                    user: req.user._id,
                    content,
                    blog_id,
                    blog_user_id
                });
                const data = Object.assign(Object.assign({}, newComment._doc), { user: req.user, createdAt: new Date().toISOString() });
                index_1.io.to(`${blog_id}`).emit('createComment', data);
                yield newComment.save();
                return res.json(newComment);
            }
            catch (error) {
                next(error);
            }
        });
        this.getComments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { limit, skip } = Pagination(req);
            try {
                const data = yield commentModel_1.default.aggregate([
                    {
                        $facet: {
                            totalData: [
                                {
                                    $match: {
                                        blog_id: new mongoose_1.default.Types.ObjectId(req.params.id),
                                        comment_root: { $exists: false },
                                        reply_user: { $exists: false }
                                    }
                                },
                                {
                                    $lookup: {
                                        "from": "users",
                                        "let": { user_id: "$user" },
                                        "pipeline": [
                                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                            { $project: { name: 1, avatar: 1 } }
                                        ],
                                        "as": "user"
                                    }
                                },
                                { $unwind: "$user" },
                                {
                                    $lookup: {
                                        "from": "comments",
                                        "let": { cm_id: "$replyCM" },
                                        "pipeline": [
                                            { $match: { $expr: { $in: ["$_id", "$$cm_id"] } } },
                                            {
                                                $lookup: {
                                                    "from": "users",
                                                    "let": { user_id: "$user" },
                                                    "pipeline": [
                                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                                        { $project: { name: 1, avatar: 1 } }
                                                    ],
                                                    "as": "user"
                                                }
                                            },
                                            { $unwind: "$user" },
                                            {
                                                $lookup: {
                                                    "from": "users",
                                                    "let": { user_id: "$reply_user" },
                                                    "pipeline": [
                                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                                        { $project: { name: 1, avatar: 1 } }
                                                    ],
                                                    "as": "reply_user"
                                                }
                                            },
                                            { $unwind: "$reply_user" }
                                        ],
                                        "as": "replyCM"
                                    }
                                },
                                { $sort: { createdAt: -1 } },
                                { $skip: skip },
                                { $limit: limit }
                            ],
                            totalCount: [
                                {
                                    $match: {
                                        blog_id: new mongoose_1.default.Types.ObjectId(req.params.id),
                                        comment_root: { $exists: false },
                                        reply_user: { $exists: false }
                                    }
                                },
                                { $count: 'count' }
                            ]
                        }
                    },
                    {
                        $project: {
                            count: { $arrayElemAt: ["$totalCount.count", 0] },
                            totalData: 1
                        }
                    }
                ]);
                const comments = data[0].totalData;
                const count = data[0].count;
                let total = 0;
                if (count % limit === 0) {
                    total = count / limit;
                }
                else {
                    total = Math.floor(count / limit) + 1;
                }
                return res.json({ comments, total });
            }
            catch (error) {
                next(error);
            }
        });
        this.replyComment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const { content, blog_id, blog_user_id, comment_root, reply_user } = req.body;
                const newComment = new commentModel_1.default({
                    user: req.user._id,
                    content,
                    blog_id,
                    blog_user_id,
                    comment_root,
                    reply_user: reply_user._id
                });
                yield commentModel_1.default.findOneAndUpdate({ _id: comment_root }, {
                    $push: { replyCM: newComment._id }
                });
                const data = Object.assign(Object.assign({}, newComment._doc), { user: req.user, reply_user: reply_user, createdAt: new Date().toISOString() });
                index_1.io.to(`${blog_id}`).emit('replyComment', data);
                yield newComment.save();
                return res.json(newComment);
            }
            catch (error) {
                next(error);
            }
        });
        this.updateComment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const { data } = req.body;
                console.log(data.content);
                const comment = yield commentModel_1.default.findOneAndUpdate({
                    _id: req.params.id, user: req.user.id
                }, { content: data.content });
                if (!comment) {
                    throw apiErrors_1.ApiError.BadRequest("Comment does not exits.");
                }
                index_1.io.to(`${data.blog_id}`).emit('updateComment', data);
                return res.json({ message: "Update Success!" });
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteComment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const comment = yield commentModel_1.default.findOneAndDelete({
                    _id: req.params.id,
                    $or: [
                        { user: req.user._id },
                        { blog_user_id: req.user._id }
                    ]
                });
                if (!comment)
                    throw apiErrors_1.ApiError.BadRequest("Comment does not exits.");
                if (comment.comment_root) {
                    // update replyCM
                    yield commentModel_1.default.findOneAndUpdate({ _id: comment.comment_root }, {
                        $pull: { replyCM: comment._id }
                    });
                }
                else {
                    // delete all comments in replyCM
                    yield commentModel_1.default.deleteMany({ _id: { $in: comment.replyCM } });
                }
                index_1.io.to(`${comment.blog_id}`).emit('deleteComment', comment);
                return res.json({ message: "Delete Success!" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CommentController();
