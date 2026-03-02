"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryCtrl_1 = __importDefault(require("../controllers/categoryCtrl"));
const auth_1 = require("../middleware/auth");
const valid_1 = require("../middleware/valid");
const router = (0, express_1.Router)();
router.route('/category')
    .post(auth_1.auth, valid_1.validCategory, categoryCtrl_1.default.createCategory)
    .get(categoryCtrl_1.default.getCategories);
router.route('/category/:id')
    .patch(auth_1.auth, valid_1.validCategory, categoryCtrl_1.default.updateCategory)
    .delete(auth_1.auth, categoryCtrl_1.default.deleteCategory);
exports.default = router;
