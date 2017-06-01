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
    }
    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
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
    }
    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
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
describe("ToList", () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let has = yield ctx.Table.Any(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728");
        if (!has) {
            let table = new model_1.Table();
            table.id = "a66fcbd29d2b4ac683c57520bfca5728";
            table.name = "测试台桌1";
            table.status = "opening";
            let tableParty = new model_1.TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = table.id;
            tableParty.openedTime = new Date().getTime();
            tableParty.status = "opening";
            yield ctx.Create(table);
            yield ctx.Create(tableParty);
        }
    }));
    it("左外连接查询,主表单个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let jr = yield ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .Where(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728")
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .Take(1)
            .ToList();
        assert.notEqual(jr, null);
        assert.equal(jr.length, 1);
        assert.equal(jr[0].desktable.id, "a66fcbd29d2b4ac683c57520bfca5728");
        if (jr[0].tableparty) {
            assert.equal(jr[0].tableparty.tableId, "a66fcbd29d2b4ac683c57520bfca5728");
        }
        else {
            assert.equal(jr[0].tableparty, null);
        }
    }));
    it("左外连接查询,主表多个数据", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
        let jr = yield ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .GroupBy(x => x.name)
            .ToList();
        assert.notEqual(jr, null);
        assert.equal(jr.length, 158);
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
        let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
        let r = yield ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, "a66fcbd29d2b4ac683c57520bfca5728");
    }));
});
//# sourceMappingURL=test.js.map