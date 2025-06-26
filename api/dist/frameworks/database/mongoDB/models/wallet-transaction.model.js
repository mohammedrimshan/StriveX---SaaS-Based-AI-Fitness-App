"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransactionModel = void 0;
const mongoose_1 = require("mongoose");
const wallet_transaction_schema_1 = require("../schemas/wallet-transaction.schema");
exports.WalletTransactionModel = (0, mongoose_1.model)("WalletTransaction", wallet_transaction_schema_1.walletTransactionSchema);
