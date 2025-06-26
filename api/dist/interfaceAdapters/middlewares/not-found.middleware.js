"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const constants_1 = require("../../shared/constants");
const notFound = (req, res) => {
    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: constants_1.ERROR_MESSAGES.ROUTE_NOT_FOUND,
    });
};
exports.notFound = notFound;
