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
    try {
        const ctx = DataContextFactory.GetDataContext("nedb");

        // const seedData = SeedData.getArticle();
        // const data = new Article();
        // extend(data, seedData);
        // const createdData = await ctx.Create(data);
        // const result = await ctx.article.First(x => x.id == seedData.id, ['seedData.id'], [seedData.id]);
        // console.log("result", result)
        await Promise.all(Array(10).fill(0).map((_, i) => i + 1).map(x => {
            const seedData = SeedData.getArticle();
            seedData.id = seedData.id + x;
            return seedData;
        }).map(seedData => {
            const ctx = DataContextFactory.GetDataContext("nedb");
            const data = new Article();
            extend(data, seedData);
            return ctx.Create(data);
        }));
        const result = await ctx.article.OrderBy(x => x.id).ToList();
        for (let i = 0, l = result.length; i < l; i++) {
            if (result[i + 1] && !(result[i].id >= result[i + 1].id)) {
                debugger
            }

        }

    } catch (error) {
        console.log("error", error);
    }


}

start();

