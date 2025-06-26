"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.updateCookieWithAccessToken = exports.setAuthCookies = void 0;
const config_1 = require("../config");
const setAuthCookies = (res, accessToken, refreshToken, accessTokenName, refreshTokenName) => {
    const isProduction = config_1.config.server.NODE_ENV === "production";
    res.cookie(accessTokenName, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
    });
    res.cookie(refreshTokenName, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
    });
};
exports.setAuthCookies = setAuthCookies;
const updateCookieWithAccessToken = (res, accessToken, accessTokenName) => {
    const isProduction = config_1.config.server.NODE_ENV === "production";
    res.cookie(accessTokenName, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
    });
};
exports.updateCookieWithAccessToken = updateCookieWithAccessToken;
const clearAuthCookies = (res, accessTokenName, refreshTokenName) => {
    res.clearCookie(accessTokenName);
    res.clearCookie(refreshTokenName);
};
exports.clearAuthCookies = clearAuthCookies;
