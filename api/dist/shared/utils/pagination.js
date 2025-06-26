"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
const constants_1 = require("@/shared/constants");
function calculatePagination({ page, limit }) {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    if (isNaN(validPage) || isNaN(validLimit)) {
        throw new Error(constants_1.ERROR_MESSAGES.VALIDATION_ERROR);
    }
    return {
        skip: (validPage - 1) * validLimit,
        limit: validLimit,
        page: validPage,
    };
}
