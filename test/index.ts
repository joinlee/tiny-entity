import { currentDataBaseType } from './config';
import { seedData } from './seed';
import { User, Article, DataContextFactory } from './dataContext';
import * as lodash from "lodash";
import * as mocha from "mocha";
import * as assert from "power-assert";

function extend(target, source: Object) {
    for (const key in source) {
        target[key] = source[key];
    }
}

describe('models/user', () => {
    const ctx = DataContextFactory.GetDataContext(currentDataBaseType);
    const seedUser = seedData.getUser();

    before(function () {
    });

    after(function () {

    })

    it('ctx.Create', async () => {
        const user = new User();
        extend(user, seedUser);
        const createdUser = await ctx.Create(user);
        assert(createdUser != null);
    });

    it('ctx.Update', async () => {
        const preUser = await ctx.user.First(x => x.id == seedUser.id);
        preUser.password = "UpdatedPassword";
        preUser.keyWords.push("UpdatedKeyWord");
        const updatedUser = await ctx.Update(preUser);
        assert(updatedUser.password == "UpdatedPassword");
        assert(updatedUser.keyWords[updatedUser.keyWords.length - 1] == "UpdatedKeyWord");
    });

    it('ctx.Delete', async () => {
        const preUser = await ctx.user.First(x => x.id == seedUser.id);
        await ctx.Delete(preUser);
        const deletedUser = await ctx.user.First(x => x.id == seedUser.id);
        assert(deletedUser == null);
    });
});