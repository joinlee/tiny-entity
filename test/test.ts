import { SeedData } from './seed';
import { User, Article, DataContextFactory } from './dataContext';
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
    try {
        const ctx = DataContextFactory.GetDataContext("mysql");
        const seedUser = SeedData.getUser();
        const user = new User();
        extend(user, seedUser);
        await ctx.Create(user);
        const createdUser = await ctx.user.First(x12321x => x12321x.id == seedUser.id, ["seedUser.id"], [seedUser.id]);
        console.log("createdUser", createdUser)
    } catch (error) {
        console.log("error", error);
    }


}

start();


