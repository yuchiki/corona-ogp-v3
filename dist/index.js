"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use('/hello', (req, res) => res.send(`hello`));
app.use('/', (req, res) => res.send(`routr`));
// ローカル確認用
if (process.env.NODE_ENV === `develop`)
    app.listen(3000);
exports.handler = (0, serverless_express_1.default)({ app });
