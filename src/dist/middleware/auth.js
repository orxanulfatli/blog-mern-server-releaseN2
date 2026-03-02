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
exports.auth = void 0;
const apiErrors_1 = require("../utils/apiErrors");
const tokenService_1 = __importDefault(require("../services/tokenService"));
const userModel_1 = __importDefault(require("../models/userModel"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorizationHeader = req.header('Authorization');
        if (!authorizationHeader)
            return next(apiErrors_1.ApiError.UnauthorizedError());
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken)
            return next(apiErrors_1.ApiError.UnauthorizedError());
        const decoded = tokenService_1.default.validateAccessToken(accessToken);
        if (!decoded)
            return next(apiErrors_1.ApiError.UnauthorizedError());
        const user = yield userModel_1.default.findOne({ _id: decoded.id });
        if (!user)
            return next(apiErrors_1.ApiError.BadRequest('user does not exist'));
        req.user = user;
        next();
    }
    catch (error) {
        next(apiErrors_1.ApiError.UnauthorizedError());
    }
});
exports.auth = auth;
