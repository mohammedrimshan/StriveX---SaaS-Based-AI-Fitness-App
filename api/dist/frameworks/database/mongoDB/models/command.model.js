"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const comment_schema_1 = require("../schemas/comment.schema");
exports.CommentModel = (0, mongoose_1.model)("Comment", comment_schema_1.commentSchema);
