import { SeedData } from './seed';
import { User, User, DataContextFactory } from './dataContext';
import * as lodash from "lodash";
import * as mocha from "mocha";
import * as assert from "power-assert";

function extend(target, source: Object) {
    for (const key in source) {
        target[key] = source[key];
    }
}
async function start() {
    debugger
    const ctx = DataContextFactory.GetDataContext("nedb");
    const seedUser = SeedData.getUser();
    const user = new User();
    extend(user, seedUser);
    await ctx.Create(user);
    const createdUser = await ctx.user.First(x => x.id == seedUser.id);
    // console.log("createdUser", createdUser);
}

start();
