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
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
    let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
    before(() => __awaiter(this, void 0, void 0, function* () {
        let ctx = DataContextFactory.GetDataContext();
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
        assert.equal(r[0].desktable.toString(), table.toString().toLocaleLowerCase(), r[0].desktable.toString() + " toString() must be " + table.toString());
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
});
describe("左外连接都是链接主表", () => {
    before(() => __awaiter(this, void 0, void 0, function* () {
    }));
    it("左外连接都是链接主表", () => __awaiter(this, void 0, void 0, function* () { }));
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
describe("Create", () => {
    let orderList = [];
    let order = { "id": "0cc9eee5e52045bfb30e3a0f6704ff5d", "orderNo": "0cc9eee5e52045bfb30e3a0f6704ff5d", "terminalName": "P2", "subtotal": 112.47, "discount": 0, "orderDiscount": 0, "amountDue": 112.47, "orderType": "pre-order", "checkoutMode": "post-paid", "status": "ordered", "createTime": 1490002817683, "closeTime": 0, "smallChangeOff": 0, "storeId": "e12657899f9f43ce8f0f44e70124234e", "creatorId": "90a76520b1564a7a8abdb8d4672df002", "creator": { "id": "90a76520b1564a7a8abdb8d4672df002", "name": "likecheng" }, "cart": { "qty": 4, "items": [{ "id": "1brp2b430ge70q2q5qbh7il3vx", "inventoryCode": "99", "inventoryName": "可口可乐99", "inventoryId": "dfe820f36b814e42bfc5f75a98455c56", "price": 101.5, "discount": -203, "discounts": [{ "discountType": "presents", "ruleId": "415a5df58b78494394e29a4cd1b77079", "ruleName": "赠送商品", "operateTime": 1490002801525, "isEntireDiscount": true, "discount": -203, "active": true }], "qty": 2, "amount": 0, "isEntireDiscount": true, "inventory": { "unit": { "unitType": null, "name": "瓶", "id": "bottle", "decimalsDigits": null, "storeId": null } }, "extended": { "promotion": "present", "singleModifier": 0, "categories": [] }, "modifiers": [], "costPrice": 99.2 }, { "id": "r74jl7yrsfx6cpx53e0hyd4lt", "inventoryCode": "3", "inventoryName": "八神奄", "inventoryId": "8a6af671859945108854c5bffd1315ad", "price": 60.25, "discount": 0, "discounts": [], "qty": 1, "amount": 60.25, "isEntireDiscount": false, "memberPrices": { "f9b2fc84234b42e382b1bca318fc103d": {} }, "inventory": { "unit": { "id": "5798c7a6e80644a184663fb792fda62f", "name": "份", "storeId": "e12657899f9f43ce8f0f44e70124234e" } }, "extended": { "singleModifier": 0, "categories": [{ "showOrder": 0, "store": { "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "style": { "color": { "id": "redorange", "value": "#eb6131" } }, "id": "802f02014b154ead806610356cbbfb77", "name": "主角队", "children": [{ "name": "所有", "id": "all_802f02014b154ead806610356cbbfb77", "showOrder": 1000000, "children": [] }] }] }, "modifiers": { "amount": 0, "items": [{ "id": "ca45c4389e7348f89a1ac9ffa5827462", "name": "ca45c4389e7348f89a1ac9ffa5827462", "amount": 0, "options": [{ "name": "防守反击", "price": 0 }] }] }, "costPrice": 20.25 }, { "id": "1gechg7xua7jcse1wa2gpblpv0", "inventoryCode": "2", "inventoryName": "克拉克", "inventoryId": "d6c763f24d844826a74e076deae69468", "price": 22.22, "discount": 0, "discounts": [], "qty": 1, "amount": 52.22, "isEntireDiscount": false, "memberPrices": { "f9b2fc84234b42e382b1bca318fc103d": {} }, "inventory": { "unit": { "id": "5798c7a6e80644a184663fb792fda62f", "name": "份", "storeId": "e12657899f9f43ce8f0f44e70124234e" } }, "extended": { "singleModifier": 30, "categories": [{ "showOrder": 0, "store": { "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "style": { "color": { "id": "redorange", "value": "#eb6131" } }, "id": "802f02014b154ead806610356cbbfb77", "name": "主角队", "children": [{ "name": "所有", "id": "all_802f02014b154ead806610356cbbfb77", "showOrder": 1000000, "children": [] }] }] }, "modifiers": { "amount": 30, "items": [{ "id": "f58781cb5b3f47fa8d0a3d96a4e107e1", "name": "f58781cb5b3f47fa8d0a3d96a4e107e1", "amount": 10, "options": [{ "name": "cabisha", "price": 10 }] }, { "id": "db19c760e0d9400e978bca95b5360ab3", "name": "db19c760e0d9400e978bca95b5360ab3", "amount": 20, "options": [{ "name": "bisha", "price": 20 }] }] }, "costPrice": 22.22 }] }, "extended": { "table": { "id": "a0bdd55ebeeb43a28a8e1007d021612d", "name": "朱莉", "capacity": 4, "storeId": "e12657899f9f43ce8f0f44e70124234e", "showOrder": 1, "zone": { "style": null, "showOrder": 0, "id": "654448db527e4221bbd32c79e116838a" }, "status": "opening", "extended": { "version": { "version": 146, "userName": "likecheng", "terminalId": "bf81befd74074040916f8ad275faef78" } }, "lock": { "terminalId": "9162bd0b18e4487ab407e21b6dd5fb63", "terminalName": "P2" } }, "tableParty": { "valid": true, "id": "99e470cca60b450ea5db174061525624", "openedTime": 1490002776495, "storeId": "e12657899f9f43ce8f0f44e70124234e", "status": "opening", "tableId": "a0bdd55ebeeb43a28a8e1007d021612d", "tableName": "朱莉", "orderId": "9f8e14de7f3b42afb6e8ef8bda96308d" }, "headCount": 4 }, "serialNo": "4-1", "member": { "id": "3dc38e6606e248a3a5c5aae804578c85", "memberNumber": "001", "name": "李科成", "mobile": "15928934970", "email": "likecheng@vip.qq.com", "sex": "Male", "searchCode": "李科成|likecheng|lkc|552", "birth": 565286400000, "joinDate": 1483077973000, "createTime": 1483077973000, "creator": { "sex": "Male", "mobile": "15928934970", "name": "likecheng", "id": "90a76520b1564a7a8abdb8d4672df002", "pic": "/api/users/90a76520b1564a7a8abdb8d4672df002/pic/bin", "email": "likecheng@vip.qq.com" }, "store": { "owner": { "sex": "Male", "mobile": "15928934970", "name": "likecheng", "id": "90a76520b1564a7a8abdb8d4672df002", "pic": "/api/users/90a76520b1564a7a8abdb8d4672df002/pic/bin", "email": "likecheng@vip.qq.com" }, "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "merchant": { "id": "lmytcey4tmcmbtejib1al8t72" }, "memberType": { "name": "主人", "showOrder": 0, "style": { "color": "brown" }, "id": "f9b2fc84234b42e382b1bca318fc103d", "discountRule": { "name": "7折", "definition": { "discountFactor": 7 }, "id": "1kha7v7qe3f478g83c4s11ky4" }, "setting": null }, "account": { "id": "3dc38e6606e248a3a5c5aae804578c85", "balance": 68.28, "totalDeposit": 100, "isPseudo": false, "lineOfCredit": 0, "operToken": "742d64bf62eb4ee0be125bfdecb4720a" }, "mgmtDomain": "e12657899f9f43ce8f0f44e70124234e", "description": "日出东方，唯我不败", "binds": {} }, "memberType": { "name": "主人", "showOrder": 0, "style": { "color": "brown" }, "id": "f9b2fc84234b42e382b1bca318fc103d", "discountRule": { "name": "7折", "definition": { "discountFactor": 7 }, "id": "1kha7v7qe3f478g83c4s11ky4" }, "setting": null }, "discounts": [], "remainAmount": 112.47, "sourceid": "mpj/mpos", "master": "9f8e14de7f3b42afb6e8ef8bda96308d" };
    class ttt {
        constructor() {
            this.ctx = DataContextFactory.GetDataContext();
        }
        insertInto() {
            return __awaiter(this, void 0, void 0, function* () {
                for (let item of orderList) {
                    yield this.ctx.Create(item);
                }
            });
        }
    }
    __decorate([
        index_1.Transaction(DataContextFactory.GetDataContext()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], ttt.prototype, "insertInto", null);
    before(() => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 50; i++) {
            let o = new model_2.Order();
            o = o.clone(order, o);
            o.id = Guid.GetGuid();
            orderList.push(o);
        }
    }));
    it("通过循环批量添加数据", () => __awaiter(this, void 0, void 0, function* () {
        let t = new ttt();
        yield t.insertInto();
        assert.ok(true, "error");
    }));
});
//# sourceMappingURL=test.js.map