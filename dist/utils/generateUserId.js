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
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const generateUserId = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const prefixMap = {
        admin: "ADM",
        user: "U",
        instructor: "AGT",
        guest: "GST",
    };
    const prefix = prefixMap[type];
    if (!prefix)
        throw new Error("Invalid user type");
    const lastUser = yield User_1.User.find({ type })
        .sort({ createdAt: -1 })
        .limit(1);
    let lastNumber = 0;
    if (lastUser.length && lastUser[0].userId) {
        const lastId = lastUser[0].userId;
        lastNumber = parseInt(lastId.replace(prefix, "")) || 0;
    }
    const newId = `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
    return newId;
});
exports.default = generateUserId;
