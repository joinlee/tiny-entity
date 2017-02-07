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
        const seedData = SeedData.getArticle();
        const data = new Article();
        extend(data, seedData);
        const createdData = await ctx.Create(data);
        const result = await ctx.article.First(x => x.id == seedData.id, ['seedData.id'], [seedData.id]);
        console.log("result", result)
    } catch (error) {
        console.log("error", error);
    }


}

start();


