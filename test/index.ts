import { currentDataBaseType } from './config';
import { SeedData } from './seed';
import { User, Article, DataContextFactory, DataContextBase } from './dataContext';
import * as lodash from "lodash";
import * as mocha from "mocha";
import * as assert from "power-assert";

export function extend(target, source: Object) {
    for (const key in source) {
        target[key] = source[key];
    }
}

function clearData(data) {
    const result = JSON.parse(JSON.stringify(data));
    delete result._id;
    delete result.queryParam;
    delete result.sqlTemp;
    return result;
}

describe('common base', () => {
    let ctx: DataContextBase, seedData;

    before(() => {
        // 在本区块的所有测试用例之前执行
        ctx = DataContextFactory.GetDataContext(currentDataBaseType);
        seedData = SeedData.getArticle();
    });

    after(function () {
        // 在本区块的所有测试用例之后执行
    });

    beforeEach(function () {
        // 在本区块的每个测试用例之前执行
    });

    afterEach(function () {
        // 在本区块的每个测试用例之后执行
    });

    it('ctx.Create', async () => {
        const data = new Article();
        extend(data, seedData);
        const createdData = await ctx.Create(data);
        assert.deepStrictEqual(seedData, clearData(createdData));
    });


    it('ctx.article.First', async () => {
        const data = await ctx.article.First(x => x.id == seedData.id, ["seedData.id"], [seedData.id]);
        assert.deepStrictEqual(seedData, clearData(data));
    });

    it('ctx.article.Where', async () => {
        const data = await ctx.article.Where(x => x.id == seedData.id, ["seedData.id"], [seedData.id]).ToList();
        assert.deepStrictEqual(seedData, clearData(data[data.length - 1]));
    });

    it('ctx.Update', async () => {
        function updateData(targetData) {
            targetData.description = "UpdatedDescription";
            targetData.topics.push("UpdatedTopic");
            targetData.detail.title = "UpdateDetailTitle";
        }

        const preData: Article = await ctx.article.First(x => x.id == seedData.id, ["seedData.id"], [seedData.id]);
        updateData(preData);
        updateData(seedData);
        const updatedData = await ctx.Update(preData);
        assert.deepStrictEqual(seedData, clearData(updatedData));
    });

    it('ctx.Delete', async () => {
        const preData = await ctx.article.First(x => x.id == seedData.id, ["seedData.id"], [seedData.id]);
        await ctx.Delete(preData);
        const deleteddata = await ctx.article.First(x => x.id == seedData.id, ["seedData.id"], [seedData.id]);
        assert(deleteddata == null);
    });


});