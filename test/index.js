"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const config_1 = require('./config');
const seed_1 = require('./seed');
const dataContext_1 = require('./dataContext');
const assert = require("power-assert");
function extend(target, source) {
    for (const key in source) {
        target[key] = source[key];
    }
}
describe('models/user', () => {
    const ctx = dataContext_1.DataContextFactory.GetDataContext(config_1.currentDataBaseType);
    const seedUser = seed_1.seedData.getUser();
    before(function () {
    });
    after(function () {
    });
    it('ctx.Create', () => __awaiter(this, void 0, void 0, function* () {
        const user = new dataContext_1.User();
        extend(user, seedUser);
        const createdUser = yield ctx.Create(user);
        assert(createdUser != null);
    }));
    it('ctx.Update', () => __awaiter(this, void 0, void 0, function* () {
        const preUser = yield ctx.user.First(x => x.id == seedUser.id);
        preUser.password = "UpdatedPassword";
        preUser.keyWords.push("UpdatedKeyWord");
        const updatedUser = yield ctx.Update(preUser);
        assert(updatedUser.password == "UpdatedPassword");
        assert(updatedUser.keyWords[updatedUser.keyWords.length - 1] == "UpdatedKeyWord");
    }));
    it('ctx.Delete', () => __awaiter(this, void 0, void 0, function* () {
        const preUser = yield ctx.user.First(x => x.id == seedUser.id);
        yield ctx.Delete(preUser);
        const deletedUser = yield ctx.user.First(x => x.id == seedUser.id);
        assert(deletedUser == null);
    }));
});
//# sourceMappingURL=index.js.map