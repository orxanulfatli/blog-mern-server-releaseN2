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
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
class CategoryController {
    constructor() {
        this.createCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                if (req.user.role !== "admin")
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const name = req.body.name.toLowerCase();
                const newCategory = new categoryModel_1.default({ name });
                yield newCategory.save();
                res.json(newCategory);
            }
            catch (error) {
                next(error);
            }
        });
        this.getCategories = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield categoryModel_1.default.find().sort("-createdAt");
                res.json({ categories });
            }
            catch (err) {
                return res.status(500).json({ msg: err.message });
            }
        });
        this.updateCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                if (req.user.role !== "admin")
                    throw apiErrors_1.ApiError.UnauthorizedError();
                yield categoryModel_1.default.findOneAndUpdate({
                    _id: req.params.id,
                }, { name: req.body.name });
                res.json({ message: "Update Success!" });
            }
            catch (error) {
                next(error);
            }
        });
        this.deleteCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                if (req.user.role !== "admin")
                    throw apiErrors_1.ApiError.UnauthorizedError();
                yield categoryModel_1.default.findByIdAndDelete(req.params.id);
                res.json({ message: "Delete Success!" });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CategoryController();
