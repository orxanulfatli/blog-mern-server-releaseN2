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
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    constructor() {
        this.updateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                const { _id } = req.user;
                const { name, avatar } = req.body;
                if (name) {
                    yield userModel_1.default.findByIdAndUpdate({ _id }, { name });
                }
                if (avatar) {
                    yield userModel_1.default.findByIdAndUpdate({ _id }, { avatar });
                }
                res.json({ success: true, message: "Update Success!" });
            }
            catch (error) {
                next(error);
            }
        });
        this.resetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw apiErrors_1.ApiError.UnauthorizedError();
                if (req.user.type !== 'register')
                    throw apiErrors_1.ApiError.BadRequest(`Quick login account with ${req.user.type} can't use this function`);
                const { password } = req.body;
                const passwordHash = yield bcrypt_1.default.hash(password, 12);
                yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, {
                    password: passwordHash
                });
                res.json({ success: true, message: "Reset Password Success!" });
            }
            catch (error) {
                next(error);
            }
        });
        this.getUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.default.findById(req.params.id).select('-password');
                if (!user)
                    throw apiErrors_1.ApiError.BadRequest('User does not exist');
                res.json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new UserController();
