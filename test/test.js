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
            const ctx = dataContext_1.DataContextFactory.GetDataContext("nedb");
            const seedData = seed_1.SeedData.getArticle();
            const limit = 5;
            yield Promise.all(Array(10).map(x => seed_1.SeedData.getArticle()).map(x => {
                const data = new dataContext_1.Article();
                extend(data, x);
                return ctx.Create(data);
            }));
            debugger;
            const data = yield ctx.article.Take(limit).ToList();
        }
        catch (error) {
            console.log("error", error);
        }
    });
}
start();
//# sourceMappingURL=test.js.map