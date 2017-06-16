"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const config_1 = require("./config");
const dataContextMysql_1 = require("./../mysql/dataContextMysql");
const dataContextNeDB_1 = require("./../nedb/dataContextNeDB");
const model_1 = require("./model");
const model_2 = require("./model");
const assert = require("assert");
class FBSDataContextNeDB extends dataContextNeDB_1.NeDBDataContext {
    constructor() {
        super({ FilePath: config_1.webconfig.dataRootDir + "/", DBName: "", IsMulitTabel: true });
        this.employee = new model_2.Employee(this);
        this.table = new model_1.Table(this);
        this.tableGroup = new model_1.TableGroup(this);
        this.tableZone = new model_1.TableZone(this);
        this.tableParty = new model_1.TableParty(this);
        this.inventory = new model_1.Inventory(this);
        this.order = new model_2.Order(this);
    }
    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
    get Order() { return this.order; }
}
class FBSDataContextMysql extends dataContextMysql_1.MysqlDataContext {
    constructor() {
        super(config_1.webconfig.mysqlConnOption);
        this.employee = new model_2.Employee(this);
        this.table = new model_1.Table(this);
        this.tableGroup = new model_1.TableGroup(this);
        this.tableZone = new model_1.TableZone(this);
        this.tableParty = new model_1.TableParty(this);
        this.inventory = new model_1.Inventory(this);
        this.order = new model_2.Order(this);
    }
    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
    get Order() { return this.order; }
}
class DataContextFactory {
    static GetDataContext() {
        if (config_1.webconfig.dbType == "nedb")
            return new FBSDataContextNeDB();
        else if (config_1.webconfig.dbType == "mysql")
            return new FBSDataContextMysql();
    }
}
class Guid {
    static GetGuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "";
        var uuid = s.join("");
        return uuid;
    }
}
console.log("当前数据库配置：", config_1.webconfig.dbType);
describe("ToList", () => {
    let ctx = DataContextFactory.GetDataContext();
    let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
    before(() => __awaiter(this, void 0, void 0, function* () {
        let hasTable = yield ctx.Table.Any(x => x.id == tableId, ["tableId"], [tableId]);
        let hasTableParty = yield ctx.TableParty.Any(x => x.tableId == tableId, ["tableId"], [tableId]);
        if (!hasTable) {
            let table = new model_1.Table();
            table.id = tableId;
            table.name = "测试台桌1";
            table.status = "opening";
            yield ctx.Create(table);
        }
        if (!hasTableParty) {
            let order = new model_2.Order();
            order.id = Guid.GetGuid();
            let tableParty = new model_1.TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = tableId;
            tableParty.openedTime = new Date().getTime();
            tableParty.status = "opening";
            tableParty.orderId = order.id;
            yield ctx.Create(tableParty);
            yield ctx.Create(order);
        }
    }));
    it("左外连接查询,主表单个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let jr = yield ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .Join(x => x.id, ctx.Order, "orderId")
            .Where(x => x.id == tableId, ["tableId"], [tableId])
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .Take(1)
            .ToList();
        assert.notEqual(jr, null, "查询结果为空");
        assert.equal(jr.length, 1, "查询条数不为1");
        assert.equal(jr[0].desktable.id, tableId, "desktable.id != tableId");
        assert.notEqual(jr[0].tableparty, null, "tableparty is null");
        assert.notEqual(jr[0].orders, null, "orders is null");
        assert.equal(jr[0].tableparty.tableId, tableId, "tableparty.tableId != tableId");
        assert.equal(jr[0].tableparty.orderId == jr[0].orders.id, true, "tableparty.orderId != orders.id");
    }));
    it("左外连接，左表无数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let tablePartyList = yield ctx.TableParty.Where(x => x.tableId == tableId, ["tableId"], [tableId]).ToList();
        for (let item of tablePartyList) {
            yield ctx.Delete(item);
        }
        let r = yield ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .Where(x => x.id == tableId, ["tableId"], [tableId])
            .ToList();
        assert.equal(r.length >= 1, true);
        assert.notEqual(r[0].desktable, null, "r[0].desktable == null");
        assert.equal(r[0].tableparty, null, "r[0].tableparty!=null");
    }));
    it("左外连接查询,主表多个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let r = yield ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .GroupBy(x => x.name)
            .ToList();
        assert.notEqual(r, null);
        assert.equal(r.length >= 1, true);
        let table = new model_1.Table();
        assert.equal(r[0].desktable.toString().toLocaleLowerCase(), table.toString().toLocaleLowerCase(), r[0].desktable.toString() + " toString() must be " + table.toString());
    }));
    it("不加任何条件查询", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let r = yield ctx.Table.ToList();
        assert.notEqual(r, null);
        assert.equal(r.length > 0, true);
        assert.notEqual(r[0].id, null);
    }));
    it("条件查询", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let r = yield ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, tableId);
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.DeleteAll(new model_1.Table());
        yield ctx.DeleteAll(new model_2.Order());
        yield ctx.DeleteAll(new model_1.TableParty());
    }));
});
describe("Join", () => {
    let ctx = DataContextFactory.GetDataContext();
    let mockDatas = {
        tableList: [],
        tableParties: [],
        orders: []
    };
    before(() => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 3; i++) {
            let order = new model_2.Order();
            order.id = Guid.GetGuid();
            order.amountDue = 100;
            yield ctx.Create(order);
            mockDatas.orders.push(order);
            let table = new model_1.Table();
            table.id = Guid.GetGuid();
            table.name = "TESTTABLE1";
            yield ctx.Create(table);
            mockDatas.tableList.push(table);
            let tableParty = new model_1.TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = table.id;
            tableParty.orderId = order.id;
            yield ctx.Create(tableParty);
            mockDatas.tableParties.push(tableParty);
        }
    }));
    it("JOIN Three Table", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.TableParty
            .Join(x => x.id, ctx.Table, "tableId", true)
            .Join(x => x.id, ctx.Order, "orderId", true)
            .ToList();
        assert.equal(r.length, 3, "");
        assert.notEqual(mockDatas.orders.find(x => x.id == r[0].orders.id), null, "");
        assert.notEqual(mockDatas.tableParties.find(x => x.id == r[1].tableparty.id), null, "");
        assert.notEqual(mockDatas.tableList.find(x => x.name == r[2].desktable.name), null, "");
    }));
    it("use Join and Take", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.TableParty
            .Join(x => x.id, ctx.Table, "tableId", true)
            .Join(x => x.id, ctx.Order, "orderId", true)
            .Take(1)
            .ToList();
        assert.equal(r.length, 1, "");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.DeleteAll(new model_1.Table());
        yield ctx.DeleteAll(new model_2.Order());
        yield ctx.DeleteAll(new model_1.TableParty());
    }));
});
describe("Contains", () => {
    let ctx = DataContextFactory.GetDataContext();
    let tableIds = [];
    before(() => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 2; i++) {
            let table = new model_1.Table();
            table.id = Guid.GetGuid();
            table.name = "TESTTABLE" + i;
            tableIds.push(table.id);
            yield ctx.Create(table);
        }
    }));
    it("only use contains function", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.Table.Contains(x => x.id, tableIds).ToList();
        assert.equal(r.length, 2, "r.length must be 2");
        assert.notEqual(r.find(x => x.id == tableIds[0]), null, "");
        assert.notEqual(r.find(x => x.id == tableIds[1]), null, "");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.DeleteAll(new model_1.Table());
    }));
});
describe("左外连接都是链接主表", () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
    }));
    it("左外连接都是链接主表");
    after(() => __awaiter(this, void 0, void 0, function* () { }));
});
describe("join + contains + where", () => {
    let table = new model_1.Table();
    table.id = "0a5f27da06804a8f984ac012d58f8356";
    table.status = "closed";
    let tbp_demo1 = new model_1.TableParty();
    tbp_demo1.id = '0dec72a0cd11439fb04c4f4385bb1c2a';
    tbp_demo1.tableId = table.id;
    tbp_demo1.status = "closed";
    let tbp_demo2 = new model_1.TableParty();
    tbp_demo2.id = '0faafe3cd8254c9a91e2f936c9743dda';
    tbp_demo2.tableId = table.id;
    tbp_demo2.status = "closed";
    before(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        yield ctx.Create(table);
        yield ctx.Create(tbp_demo1);
        yield ctx.Create(tbp_demo2);
    }));
    it("join + contains + where", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let tbpIds = ["0dec72a0cd11439fb04c4f4385bb1c2a", "0faafe3cd8254c9a91e2f936c9743dda"];
        let r = yield ctx.TableParty
            .Contains(x => x.id, tbpIds)
            .Join(x => x.id, ctx.Table, "tableId")
            .Where(x => x.status == "closed")
            .ToList();
        assert.equal(r.length, 2, "r.length must be 2");
        assert.equal(r[0].desktable.id, table.id, "table.id must be " + table.id);
        assert.equal(r[0].desktable.toString(), table.toString().toLocaleLowerCase(), r[0].desktable.toString().toLocaleLowerCase() + " toString() must be " + table.toString());
        assert.equal(r[0].tableparty.toString(), tbp_demo1.toString().toLocaleLowerCase(), r[0].tableparty.toString() + " toString() must be " + tbp_demo1.toString());
        assert.equal(r[0].desktable.joinParams == undefined, true, "joinParams must be null");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        yield ctx.Delete(table);
        yield ctx.Delete(tbp_demo1);
        yield ctx.Delete(tbp_demo2);
    }));
});
//# sourceMappingURL=test.js.map