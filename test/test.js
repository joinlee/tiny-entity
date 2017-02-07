"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const seed_1 = require('./seed');
const dataContext_1 = require('./dataContext');
function extend(target, source) {
    for (const key in source) {
        target[key] = source[key];
    }
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        debugger;
        try {
            const ctx = dataContext_1.DataContextFactory.GetDataContext("mysql");
            const seedData = seed_1.SeedData.getArticle();
            const data = new dataContext_1.Article();
            extend(data, seedData);
            const createdData = yield ctx.Create(data);
            const result = yield ctx.article.First(x => x.id == seedData.id, ['seedData.id'], [seedData.id]);
            console.log("result", result);
        }
        catch (error) {
            console.log("error", error);
        }
    });
}
start();
//# sourceMappingURL=test.js.map