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
        try {
            const ctx = dataContext_1.DataContextFactory.GetDataContext("nedb");
            yield Promise.all(Array(10).fill(0).map((_, i) => i + 1).map(x => {
                const seedData = seed_1.SeedData.getArticle();
                seedData.id = seedData.id + x;
                return seedData;
            }).map(seedData => {
                const ctx = dataContext_1.DataContextFactory.GetDataContext("nedb");
                const data = new dataContext_1.Article();
                extend(data, seedData);
                return ctx.Create(data);
            }));
            const result = yield ctx.article.OrderBy(x => x.id).ToList();
            for (let i = 0, l = result.length; i < l; i++) {
                if (result[i + 1] && !(result[i].id >= result[i + 1].id)) {
                    debugger;
                }
            }
        }
        catch (error) {
            console.log("error", error);
        }
    });
}
start();
//# sourceMappingURL=test.js.map