"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const blogCtrl_1 = __importDefault(require("../controllers/blogCtrl"));
const router = (0, express_1.Router)();
router.post('/blog', auth_1.auth, blogCtrl_1.default.createBlog);
router.get('/home/blogs', blogCtrl_1.default.getHomeBlogs);
router.get('/blogs/category/:id', blogCtrl_1.default.getBlogsByCategory);
router.get('/blogs/user/:id', blogCtrl_1.default.getBlogsByUser);
router.get('/blog/:id', blogCtrl_1.default.getBlog);
exports.default = router;
