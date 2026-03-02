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
const generateToken_1 = require("../config/generateToken");
const mailService_1 = __importDefault(require("../services/mailService"));
const valid_1 = require("../middleware/valid");
const sendSMS_1 = require("../config/sendSMS");
const loginService_1 = __importDefault(require("../services/loginService"));
const tokenService_1 = __importDefault(require("../services/tokenService"));
const prod = process.env.NODE_ENV === 'production';
const CLIENT_URL = prod ? `${process.env.BASE_NETLIFY_URL}` : `${process.env.BASE_URL}`;
/*you can make register and activation same in heroku first in register get only
name and account then in activation get password and activate account and login in*/
class AuthCtrl {
    constructor() {
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, account, password } = req.body;
                const user = yield userModel_1.default.findOne({ account });
                if (user)
                    throw apiErrors_1.ApiError.BadRequest("Email or Phone number already exists.");
                const passwordHash = yield bcrypt_1.default.hash(password, 12);
                const newUser = {
                    name,
                    account,
                    password: passwordHash,
                };
                const activeToken = (0, generateToken_1.generateActiveToken)({ newUser });
                const url = `${CLIENT_URL}/active/${activeToken}`;
                if ((0, valid_1.validateEmail)(account)) {
                    mailService_1.default.sendActivationEmail(account, url, "Verify your email address.");
                    return res.json({
                        success: true,
                        message: "Success! Please check your email to activate you account.",
                    });
                }
                else if ((0, valid_1.validPhone)(account)) {
                    (0, sendSMS_1.sendSms)(account, url, "Verify your phone number");
                    return res.json({
                        success: true,
                        message: "Success! Please check your phone to activate you account.",
                    });
                }
                res.json({
                    message: "Register successfully.",
                    data: newUser,
                    activeToken,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.activateAccount = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { activeToken } = req.body;
                const decoded = tokenService_1.default.validateActiveToken(activeToken);
                if (!decoded) {
                    return next(apiErrors_1.ApiError.BadRequest("Invalid authentication."));
                }
                const user = yield userModel_1.default.findOne({ account: (_a = decoded.newUser) === null || _a === void 0 ? void 0 : _a.account });
                if (user) {
                    return next(apiErrors_1.ApiError.BadRequest("Account already activated"));
                }
                const newUser = new userModel_1.default(decoded.newUser);
                yield newUser.save();
                res.json({ message: "Account has been activated!" });
            }
            catch (err) {
                // let errMsg;
                // if (err.code === 11000) {
                //     errMsg = Object.keys(err.keyValue)[0] + " already exists."
                // } else {
                //     let name = Object.keys(err.errors)[0]
                //     errMsg = err.errors[`${name}`].message
                // }
                // return res.status(500).json({ msg: errMsg })
                next(err);
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { account, password } = req.body;
                const user = yield userModel_1.default.findOne({ account });
                //check user is exist or not
                if (!user) {
                    throw apiErrors_1.ApiError.BadRequest("This account does not exist!");
                }
                const userData = yield loginService_1.default.login(user, password);
                res.cookie("refreshToken", userData.refreshToken, {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: `/api/refresh_token`,
                    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
                });
                res.json({
                    success: true,
                    message: "Login Success!",
                    accessToken: userData.accessToken,
                    user: userData.user,
                });
            }
            catch (err) {
                next(err);
            }
        });
        this.logout = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("refreshToken", {
                    path: `/api/refresh_token`,
                });
                return res.json({ msg: "Logged out!" });
            }
            catch (error) {
                next(error);
            }
        });
        this.refresh = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                if (!refreshToken) {
                    throw apiErrors_1.ApiError.UnauthorizedError();
                }
                //validate refres token
                const decoded = (tokenService_1.default.validateRefreshToken(refreshToken));
                if (!decoded) {
                    throw apiErrors_1.ApiError.UnauthorizedError();
                }
                const user = yield userModel_1.default.findById(decoded.id).select("-password");
                if (!user) {
                    throw apiErrors_1.ApiError.BadRequest("This account does not exist.");
                }
                const accessToken = (0, generateToken_1.generateAccessToken)({ id: user.id });
                //you must also generate new refresh token and send with cookie and
                //dont forget model in db for refresh token
                res.json({ success: true, message: "Success!", accessToken, user });
            }
            catch (error) {
                next(error);
            }
        });
        this.sendOTP = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone } = req.body;
                const data = yield (0, sendSMS_1.smsOTP)(phone, "sms");
                res.json(data);
            }
            catch (error) {
                next(error);
            }
        });
        this.verifyOTP = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone, code } = req.body;
                const data = yield (0, sendSMS_1.smsVerify)(phone, code);
                if (!data)
                    throw apiErrors_1.ApiError.BadRequest("Invalid Authentication");
                const password = phone + "your phone secrect password";
                const passwordHash = yield bcrypt_1.default.hash(password, 12);
                const user = yield userModel_1.default.findOne({ account: phone });
                if (user) {
                    const userData = yield loginService_1.default.login(user, password);
                    res.cookie("refreshToken", userData.refreshToken, {
                        httpOnly: true,
                        path: `/api/refresh_token`,
                        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
                    });
                    res.json({
                        success: true,
                        message: "Login Success!",
                        accessToken: userData.accessToken,
                        user: userData.user,
                    });
                }
                else {
                    const user = {
                        name: phone,
                        account: phone,
                        password: passwordHash,
                        type: 'sms'
                    };
                    registerUser(user, res);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
}
const registerUser = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new userModel_1.default(user);
    yield newUser.save();
    const accessToken = (0, generateToken_1.generateAccessToken)({ id: newUser._id });
    const refreshToken = (0, generateToken_1.generateRefreshToken)({ id: newUser._id });
    res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: `/api/refresh_token`,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
    });
    res.json({
        success: true,
        message: 'Login Success!',
        accessToken,
        user: Object.assign(Object.assign({}, newUser._doc), { password: '' })
    });
});
exports.default = new AuthCtrl();
