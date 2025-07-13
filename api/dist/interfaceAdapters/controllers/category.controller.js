"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.CategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const mongoose_1 = __importDefault(require("mongoose"));
let CategoryController = class CategoryController {
    constructor(_createNewCategoryUseCase, _getAllPaginatedCategoryUseCase, _updateCategoryStatusUseCase, _updateCategoryUseCase, _getAllCategoriesUseCase) {
        this._createNewCategoryUseCase = _createNewCategoryUseCase;
        this._getAllPaginatedCategoryUseCase = _getAllPaginatedCategoryUseCase;
        this._updateCategoryStatusUseCase = _updateCategoryStatusUseCase;
        this._updateCategoryUseCase = _updateCategoryUseCase;
        this._getAllCategoriesUseCase = _getAllCategoriesUseCase;
    }
    createNewCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, metValue, description } = req.body;
                if (!name)
                    throw new custom_error_1.CustomError("Category name is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                yield this._createNewCategoryUseCase.execute(name, metValue, description);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof Error &&
                    error.message.includes("Category already exists")) {
                    res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                        success: false,
                        message: "A category with this name already exists",
                        error: "DUPLICATE_CATEGORY",
                    });
                    return;
                }
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllPaginatedCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, searchTerm = "" } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                const searchTermString = typeof searchTerm === "string" ? searchTerm : "";
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid page or limit parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { categories, total, all } = yield this._getAllPaginatedCategoryUseCase.execute(pageNumber, pageSize, searchTermString);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    categories,
                    totalPages: total,
                    currentPage: pageNumber,
                    totalCategory: all,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateCategoryStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId } = req.params;
                // Enhanced validation
                if (!categoryId || categoryId === "undefined") {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._updateCategoryStatusUseCase.execute(categoryId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId } = req.params;
                const { name, description, metValue } = req.body;
                if (!categoryId)
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                if (!name)
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_FIELDS, constants_1.HTTP_STATUS.BAD_REQUEST);
                yield this._updateCategoryUseCase.execute(categoryId, name, metValue, description);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield this._getAllCategoriesUseCase.execute();
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    categories,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.CategoryController = CategoryController;
exports.CategoryController = CategoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateNewCategoryUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetAllPaginatedCategoryUseCase")),
    __param(2, (0, tsyringe_1.inject)("IUpdateCategoryStatusUseCase")),
    __param(3, (0, tsyringe_1.inject)("IUpdateCategoryUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetAllCategoriesUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CategoryController);
