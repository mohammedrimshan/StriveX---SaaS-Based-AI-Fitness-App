"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const constants_1 = require("../../shared/constants");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || constants_1.ERROR_MESSAGES.SERVER_ERROR;
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
};
exports.errorHandler = errorHandler;
