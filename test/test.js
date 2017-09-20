"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const dataContextMysql_1 = require("./../mysql/dataContextMysql");
const dataContextNeDB_1 = require("./../nedb/dataContextNeDB");
const model_1 = require("./model");
const model_2 = require("./model");
const index_1 = require("../index");
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
            table.zone = {
                id: Guid.GetGuid(),
                name: "testName"
            };
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
            tableParty.openedTime = new Date().getTime();
            yield ctx.Create(tableParty);
            yield ctx.Create(order);
        }
    }));
    it("左外连接查询,主表单个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let jr = yield ctx.Table
            .LeftJoin(ctx.TableParty)
            .On((m, f) => m.id == f.tableId)
            .LeftJoin(ctx.Order)
            .On((m, f) => m.orderId == f.id, ctx.TableParty)
            .Where(x => x.id == tableId, ["tableId"], [tableId])
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
            .LeftJoin(ctx.TableParty)
            .On((m, f) => m.id == f.tableId)
            .Where(x => x.id == tableId, ["tableId"], [tableId])
            .ToList();
        assert.equal(r.length >= 1, true);
        assert.notEqual(r[0].desktable, null, "r[0].desktable == null");
        assert.equal(r[0].tableparty, null, "r[0].tableparty!=null");
    }));
    it("左外连接查询,主表多个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let r = yield ctx.Table.LeftJoin(ctx.TableParty).On((m, f) => m.id == f.tableId).OrderByDesc(x => x.openedTime, ctx.TableParty)
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
        yield ctx.Delete(ctx.Table, x => x.id == tableId, ["tableId"], [tableId]);
        yield ctx.Delete(ctx.TableParty, x => x.id != null);
        yield ctx.Delete(ctx.Order, x => x.id != null);
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
    it("左外连接3张表", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.TableParty
            .LeftJoin(ctx.Table)
            .On((m, y) => m.tableId == y.id)
            .LeftJoin(ctx.Order)
            .On((x, y) => x.orderId == y.id)
            .ToList();
        assert.equal(r.length, 3, "");
        assert.notEqual(mockDatas.orders.find(x => x.id == r[0].orders.id), null, "");
        assert.notEqual(mockDatas.tableParties.find(x => x.id == r[1].tableparty.id), null, "");
        assert.notEqual(mockDatas.tableList.find(x => x.name == r[2].desktable.name), null, "");
    }));
    it("左外连接获取第一条数据", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.TableParty.LeftJoin(ctx.Table).On((m, f) => m.tableId == f.id).LeftJoin(ctx.Order).On((m, f) => m.orderId == f.id).Take(1)
            .ToList();
        assert.equal(r.length, 1, "");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.Delete(ctx.Table, x => x.id != null);
        yield ctx.Delete(ctx.TableParty, x => x.id != null);
        yield ctx.Delete(ctx.Order, x => x.id != null);
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
    it("Contains查询，等同于In", () => __awaiter(this, void 0, void 0, function* () {
        let r = yield ctx.Table.Contains(x => x.id, tableIds).ToList();
        assert.equal(r.length, 2, "r.length must be 2");
        assert.notEqual(r.find(x => x.id == tableIds[0]), null, "");
        assert.notEqual(r.find(x => x.id == tableIds[1]), null, "");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.Delete(ctx.Table, x => x.id != null);
    }));
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
            .LeftJoin(ctx.Table)
            .On((m, f) => m.tableId == f.id)
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
describe("transcation", () => {
    let guid = Guid.GetGuid();
    class TestService {
        Action1() {
            return __awaiter(this, void 0, void 0, function* () {
                let emp = new model_2.Employee();
                emp.id = guid;
                emp.storeId = "testStore";
                emp.employeeNumber = "likecheng";
                let e = yield this.ctx.Create(emp);
                for (let index = 0; index < 3; index++) {
                    yield this.Action2();
                }
            });
        }
        Action2() {
            return __awaiter(this, void 0, void 0, function* () {
                let emp = new model_2.Employee();
                emp.id = guid;
                emp.storeId = "testStore";
                emp.employeeNumber = "likecheng2";
                yield this.ctx.Create(emp);
            });
        }
    }
    __decorate([
        index_1.Transaction(DataContextFactory.GetDataContext()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], TestService.prototype, "Action1", null);
    __decorate([
        index_1.Transaction(DataContextFactory.GetDataContext()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], TestService.prototype, "Action2", null);
    it("transcation on", () => __awaiter(this, void 0, void 0, function* () {
        let svr = new TestService();
        try {
            yield svr.Action1();
        }
        catch (error) {
            console.error(error);
        }
        finally {
            let ctx = DataContextFactory.GetDataContext();
            let list = yield ctx.Employee.Where(x => x.storeId == "testStore").ToList();
            assert.equal(list.length == 0, true, "事务操作失败，已有数据写入到数据库！" + list.length);
        }
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let list = yield ctx.Employee.Where(x => x.storeId == "testStore").ToList();
        for (let item of list) {
            yield ctx.Delete(item);
        }
    }));
});
describe("查询字段是NUll的情况", () => {
    let table;
    before(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        table = new model_1.Table();
        table.id = Guid.GetGuid();
        table.name = "测试台桌";
        yield ctx.Create(table);
    }));
    it("查询字段是NUll 情况", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let tableResult = yield ctx.Table.Where(x => x.status == null && x.name == table.name, ["table.name"], [table.name]).ToList();
        assert.equal(tableResult.length, 1, "ableResult.length must be 1");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        yield ctx.Delete(table);
    }));
});
describe("sql注入攻击", () => {
    let table;
    before(() => {
        table = new model_1.Table();
        table.id = Guid.GetGuid();
        table.name = "likecheng.xx, name != 1 ' % \\";
    });
    it("执行包含sql注入的语句", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        yield ctx.Create(table);
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        yield ctx.Delete(table);
    }));
});
describe("IndexOf", () => {
    let table = new model_1.Table();
    table.id = Guid.GetGuid();
    table.name = "测试模糊查询台桌, '' xx && %%";
    table.status = "opening";
    let ctx = DataContextFactory.GetDataContext();
    before(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.Create(table);
    }));
    it("模糊查询", () => __awaiter(this, void 0, void 0, function* () {
        let tableName = "模糊查";
        let r = yield ctx.Table.Where(x => x.name.IndexOf("模糊") && x.status == "opening").ToList();
        let r2 = yield ctx.Table.Where(x => x.name.IndexOf(tableName), ["tableName"], [tableName]).ToList();
        assert.equal(r.length, 1, "当前结果应该是1 ");
        assert.equal(r2.length, 1, "r2 的结果应该是1");
    }));
    after(() => __awaiter(this, void 0, void 0, function* () {
        yield ctx.Delete(table);
    }));
});
//# sourceMappingURL=test.js.map