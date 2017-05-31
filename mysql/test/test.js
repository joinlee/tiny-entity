"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const index_1 = require("../index");
const model_1 = require("./model");
const assert = require("assert");
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
class TestDataContext extends index_1.MysqlDataContext {
    constructor() {
        super({
            connectionLimit: 50,
            host: '172.16.254.127',
            user: 'root',
            password: 'onetwo',
            database: 'fbs_db'
        });
        this.employee = new model_1.Employee(this);
        this.order = new model_1.Order(this);
        this.table = new model_1.Table(this);
        this.tableParty = new model_1.TableParty(this);
    }
    get Employee() { return this.employee; }
    get Order() { return this.order; }
    get Table() { return this.table; }
    get TableParty() { return this.tableParty; }
}
function Test1() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
        let r = yield ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        console.log(r);
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, "a66fcbd29d2b4ac683c57520bfca5728");
    });
}
describe("ToList", () => {
    it("左外连接查询", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        let jr = yield ctx.Table
            .Join(ctx.TableParty, x => x.tableId)
            .Where(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728")
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .Take(1)
            .ToList();
        assert.notEqual(jr, null);
        assert.equal(jr.length, 1);
        assert.equal(jr[0].desktable.id, "a66fcbd29d2b4ac683c57520bfca5728");
        assert.equal(jr[0].tableparty.tableId, "a66fcbd29d2b4ac683c57520bfca5728");
    }));
    it("不加任何条件查询", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        let r = yield ctx.Table.ToList();
        assert.notEqual(r, null);
        assert.equal(r.length > 0, true);
        assert.notEqual(r[0].id, null);
    }));
    it("条件查询", () => __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
        let r = yield ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, "a66fcbd29d2b4ac683c57520bfca5728");
    }));
});
//# sourceMappingURL=test.js.map