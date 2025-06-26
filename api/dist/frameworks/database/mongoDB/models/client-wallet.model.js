"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientWalletModel = void 0;
const mongoose_1 = require("mongoose");
const client_wallet_schema_1 = require("../schemas/client-wallet.schema");
exports.ClientWalletModel = (0, mongoose_1.model)("ClientWallet", client_wallet_schema_1.clientWalletSchema);
