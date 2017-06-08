import { webconfig } from './config';
import { MysqlDataContext } from './../mysql/dataContextMysql';
import { NeDBDataContext } from './../nedb/dataContextNeDB';
import { Table, TableZone, TableGroup, TableParty, Inventory } from './model';
import { Employee, Order } from "./model";
import { IDataContext, Transaction } from "../index";
import * as assert from "assert";

interface FBSDataContextBase extends IDataContext {
    Employee: Employee;
    Table: Table;
    TableGroup: TableGroup;
    TableZone: TableZone;
    TableParty: TableParty;
    Inventory: Inventory;
    Order: Order;
}
class FBSDataContextNeDB extends NeDBDataContext implements FBSDataContextBase {
    private employee: Employee;
    private table: Table;
    private tableGroup: TableGroup;
    private tableZone: TableZone;
    private tableParty: TableParty;
    private inventory: Inventory;
    private order: Order;

    constructor() {
        super({ FilePath: webconfig.dataRootDir + "/", DBName: "", IsMulitTabel: true });

        this.employee = new Employee(this);
        this.table = new Table(this);
        this.tableGroup = new TableGroup(this);
        this.tableZone = new TableZone(this);
        this.tableParty = new TableParty(this);
        this.inventory = new Inventory(this);
        this.order = new Order(this);
    }

    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
    get Order() { return this.order; }

}
class FBSDataContextMysql extends MysqlDataContext implements FBSDataContextBase {
    private employee: Employee;
    private table: Table;
    private tableGroup: TableGroup;
    private tableZone: TableZone;
    private tableParty: TableParty;
    private inventory: Inventory;
    private order: Order;

    constructor() {
        super(webconfig.mysqlConnOption);

        this.employee = new Employee(this);
        this.table = new Table(this);
        this.tableGroup = new TableGroup(this);
        this.tableZone = new TableZone(this);
        this.tableParty = new TableParty(this);
        this.inventory = new Inventory(this);
        this.order = new Order(this);
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
    static GetDataContext(): FBSDataContextBase {
        if (webconfig.dbType == "nedb") return new FBSDataContextNeDB();
        else if (webconfig.dbType == "mysql") return new FBSDataContextMysql();
    }
}
class Guid {
    static GetGuid(): string {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "";

        var uuid = s.join("");
        return uuid;
    }
}

console.log("当前数据库配置：", webconfig.dbType);
describe("ToList", () => {
    let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
    before(async () => {
        // 在本区块的所有测试用例之前执行
        let ctx = DataContextFactory.GetDataContext();
        let hasTable = await ctx.Table.Any(x => x.id == tableId, ["tableId"], [tableId]);
        let hasTableParty = await ctx.TableParty.Any(x => x.tableId == tableId, ["tableId"], [tableId]);

        if (!hasTable) {
            let table = new Table();
            table.id = tableId;
            table.name = "测试台桌1";
            table.status = "opening";

            await ctx.Create(table);
        }

        if (!hasTableParty) {
            let order = new Order();
            order.id = Guid.GetGuid();

            let tableParty = new TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = tableId;
            tableParty.openedTime = new Date().getTime();
            tableParty.status = "opening";
            tableParty.orderId = order.id;

            await ctx.Create(tableParty);
            await ctx.Create(order);
        }
    })
    it("左外连接查询,主表单个数据", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let jr = await ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .Join<Order>(x => x.id, ctx.Order, "orderId")
            .Where(x => x.id == tableId, ["tableId"], [tableId])
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .Take(1)
            .ToList<{ desktable: Table; tableparty: TableParty; orders: Order }>();
        assert.notEqual(jr, null, "查询结果为空");
        assert.equal(jr.length, 1, "查询条数不为1");
        assert.equal(jr[0].desktable.id, tableId, "desktable.id != tableId");
        assert.notEqual(jr[0].tableparty, null, "tableparty is null");
        assert.notEqual(jr[0].orders, null, "orders is null");
        assert.equal(jr[0].tableparty.tableId, tableId, "tableparty.tableId != tableId");
        assert.equal(jr[0].tableparty.orderId == jr[0].orders.id, true, "tableparty.orderId != orders.id");
    })

    it("左外连接，左表无数据", async () => {
        //清空左表
        let ctx = DataContextFactory.GetDataContext();
        let tablePartyList = await ctx.TableParty.Where(x => x.tableId == tableId, ["tableId"], [tableId]).ToList();
        for (let item of tablePartyList) {
            await ctx.Delete(item);
        }

        // 左外连接查询
        let r = await ctx.Table
            .Join<TableParty>(x => x.tableId, ctx.TableParty)
            .Where(x => x.id == tableId, ["tableId"], [tableId])
            .ToList<{ desktable: Table; tableparty: TableParty; }>();
        assert.equal(r.length >= 1, true);
        assert.notEqual(r[0].desktable, null, "r[0].desktable == null");
        assert.equal(r[0].tableparty, null, "r[0].tableparty!=null");
    });

    it("左外连接查询,主表多个数据", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let r = await ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .GroupBy(x => x.name)
            .ToList<{ desktable: Table; tableparty: TableParty }>();
        assert.notEqual(r, null);
        assert.equal(r.length >= 1, true);
        let table = new Table();
        assert.equal(r[0].desktable.toString(), table.toString().toLocaleLowerCase(), r[0].desktable.toString() + " toString() must be " + table.toString());
    })

    it("不加任何条件查询", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let r = await ctx.Table.ToList();
        assert.notEqual(r, null);
        assert.equal(r.length > 0, true);
        assert.notEqual(r[0].id, null);
    })

    it("条件查询", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let r = await ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, tableId);
    })
});

describe("左外连接都是链接主表", () => {
    before(async () => {

    })
    it("左外连接都是链接主表", async () => { })
    after(async () => { })
})

describe("join + contains + where", () => {
    let table = new Table();
    table.id = "0a5f27da06804a8f984ac012d58f8356";
    table.status = "closed";

    let tbp_demo1 = new TableParty();
    tbp_demo1.id = '0dec72a0cd11439fb04c4f4385bb1c2a';
    tbp_demo1.tableId = table.id;
    tbp_demo1.status = "closed";

    let tbp_demo2 = new TableParty();
    tbp_demo2.id = '0faafe3cd8254c9a91e2f936c9743dda';
    tbp_demo2.tableId = table.id;
    tbp_demo2.status = "closed";

    before(async () => {
        let ctx = DataContextFactory.GetDataContext();

        await ctx.Create(table);
        await ctx.Create(tbp_demo1);
        await ctx.Create(tbp_demo2);
    })
    it("join + contains + where", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let tbpIds = ["0dec72a0cd11439fb04c4f4385bb1c2a", "0faafe3cd8254c9a91e2f936c9743dda"];

        let r = await ctx.TableParty
            .Contains(x => x.id, tbpIds)
            .Join<Table>(x => x.id, ctx.Table, "tableId")
            .Where(x => x.status == "closed")
            .ToList<{ tableparty: TableParty; desktable: Table; }>();

        assert.equal(r.length, 2, "r.length must be 2");
        assert.equal(r[0].desktable.id, table.id, "table.id must be " + table.id);
        assert.equal(r[0].desktable.toString(), table.toString().toLocaleLowerCase(), r[0].desktable.toString().toLocaleLowerCase() + " toString() must be " + table.toString());
        assert.equal(r[0].tableparty.toString(), tbp_demo1.toString().toLocaleLowerCase(), r[0].tableparty.toString() + " toString() must be " + tbp_demo1.toString());
        assert.equal((<any>r[0].desktable).joinParams == undefined, true, "joinParams must be null");
    })

    after(async () => {
        let ctx = DataContextFactory.GetDataContext();
        // clean data;
        await ctx.Delete(table);
        await ctx.Delete(tbp_demo1);
        await ctx.Delete(tbp_demo2);
    })
})

describe("Create", () => {
    let orderList: Order[] = [];
    let order: any = { "id": "0cc9eee5e52045bfb30e3a0f6704ff5d", "orderNo": "0cc9eee5e52045bfb30e3a0f6704ff5d", "terminalName": "P2", "subtotal": 112.47, "discount": 0, "orderDiscount": 0, "amountDue": 112.47, "orderType": "pre-order", "checkoutMode": "post-paid", "status": "ordered", "createTime": 1490002817683, "closeTime": 0, "smallChangeOff": 0, "storeId": "e12657899f9f43ce8f0f44e70124234e", "creatorId": "90a76520b1564a7a8abdb8d4672df002", "creator": { "id": "90a76520b1564a7a8abdb8d4672df002", "name": "likecheng" }, "cart": { "qty": 4, "items": [{ "id": "1brp2b430ge70q2q5qbh7il3vx", "inventoryCode": "99", "inventoryName": "可口可乐99", "inventoryId": "dfe820f36b814e42bfc5f75a98455c56", "price": 101.5, "discount": -203, "discounts": [{ "discountType": "presents", "ruleId": "415a5df58b78494394e29a4cd1b77079", "ruleName": "赠送商品", "operateTime": 1490002801525, "isEntireDiscount": true, "discount": -203, "active": true }], "qty": 2, "amount": 0, "isEntireDiscount": true, "inventory": { "unit": { "unitType": null, "name": "瓶", "id": "bottle", "decimalsDigits": null, "storeId": null } }, "extended": { "promotion": "present", "singleModifier": 0, "categories": [] }, "modifiers": [], "costPrice": 99.2 }, { "id": "r74jl7yrsfx6cpx53e0hyd4lt", "inventoryCode": "3", "inventoryName": "八神奄", "inventoryId": "8a6af671859945108854c5bffd1315ad", "price": 60.25, "discount": 0, "discounts": [], "qty": 1, "amount": 60.25, "isEntireDiscount": false, "memberPrices": { "f9b2fc84234b42e382b1bca318fc103d": {} }, "inventory": { "unit": { "id": "5798c7a6e80644a184663fb792fda62f", "name": "份", "storeId": "e12657899f9f43ce8f0f44e70124234e" } }, "extended": { "singleModifier": 0, "categories": [{ "showOrder": 0, "store": { "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "style": { "color": { "id": "redorange", "value": "#eb6131" } }, "id": "802f02014b154ead806610356cbbfb77", "name": "主角队", "children": [{ "name": "所有", "id": "all_802f02014b154ead806610356cbbfb77", "showOrder": 1000000, "children": [] }] }] }, "modifiers": { "amount": 0, "items": [{ "id": "ca45c4389e7348f89a1ac9ffa5827462", "name": "ca45c4389e7348f89a1ac9ffa5827462", "amount": 0, "options": [{ "name": "防守反击", "price": 0 }] }] }, "costPrice": 20.25 }, { "id": "1gechg7xua7jcse1wa2gpblpv0", "inventoryCode": "2", "inventoryName": "克拉克", "inventoryId": "d6c763f24d844826a74e076deae69468", "price": 22.22, "discount": 0, "discounts": [], "qty": 1, "amount": 52.22, "isEntireDiscount": false, "memberPrices": { "f9b2fc84234b42e382b1bca318fc103d": {} }, "inventory": { "unit": { "id": "5798c7a6e80644a184663fb792fda62f", "name": "份", "storeId": "e12657899f9f43ce8f0f44e70124234e" } }, "extended": { "singleModifier": 30, "categories": [{ "showOrder": 0, "store": { "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "style": { "color": { "id": "redorange", "value": "#eb6131" } }, "id": "802f02014b154ead806610356cbbfb77", "name": "主角队", "children": [{ "name": "所有", "id": "all_802f02014b154ead806610356cbbfb77", "showOrder": 1000000, "children": [] }] }] }, "modifiers": { "amount": 30, "items": [{ "id": "f58781cb5b3f47fa8d0a3d96a4e107e1", "name": "f58781cb5b3f47fa8d0a3d96a4e107e1", "amount": 10, "options": [{ "name": "cabisha", "price": 10 }] }, { "id": "db19c760e0d9400e978bca95b5360ab3", "name": "db19c760e0d9400e978bca95b5360ab3", "amount": 20, "options": [{ "name": "bisha", "price": 20 }] }] }, "costPrice": 22.22 }] }, "extended": { "table": { "id": "a0bdd55ebeeb43a28a8e1007d021612d", "name": "朱莉", "capacity": 4, "storeId": "e12657899f9f43ce8f0f44e70124234e", "showOrder": 1, "zone": { "style": null, "showOrder": 0, "id": "654448db527e4221bbd32c79e116838a" }, "status": "opening", "extended": { "version": { "version": 146, "userName": "likecheng", "terminalId": "bf81befd74074040916f8ad275faef78" } }, "lock": { "terminalId": "9162bd0b18e4487ab407e21b6dd5fb63", "terminalName": "P2" } }, "tableParty": { "valid": true, "id": "99e470cca60b450ea5db174061525624", "openedTime": 1490002776495, "storeId": "e12657899f9f43ce8f0f44e70124234e", "status": "opening", "tableId": "a0bdd55ebeeb43a28a8e1007d021612d", "tableName": "朱莉", "orderId": "9f8e14de7f3b42afb6e8ef8bda96308d" }, "headCount": 4 }, "serialNo": "4-1", "member": { "id": "3dc38e6606e248a3a5c5aae804578c85", "memberNumber": "001", "name": "李科成", "mobile": "15928934970", "email": "likecheng@vip.qq.com", "sex": "Male", "searchCode": "李科成|likecheng|lkc|552", "birth": 565286400000, "joinDate": 1483077973000, "createTime": 1483077973000, "creator": { "sex": "Male", "mobile": "15928934970", "name": "likecheng", "id": "90a76520b1564a7a8abdb8d4672df002", "pic": "/api/users/90a76520b1564a7a8abdb8d4672df002/pic/bin", "email": "likecheng@vip.qq.com" }, "store": { "owner": { "sex": "Male", "mobile": "15928934970", "name": "likecheng", "id": "90a76520b1564a7a8abdb8d4672df002", "pic": "/api/users/90a76520b1564a7a8abdb8d4672df002/pic/bin", "email": "likecheng@vip.qq.com" }, "branchName": "李记食府", "id": "e12657899f9f43ce8f0f44e70124234e" }, "merchant": { "id": "lmytcey4tmcmbtejib1al8t72" }, "memberType": { "name": "主人", "showOrder": 0, "style": { "color": "brown" }, "id": "f9b2fc84234b42e382b1bca318fc103d", "discountRule": { "name": "7折", "definition": { "discountFactor": 7 }, "id": "1kha7v7qe3f478g83c4s11ky4" }, "setting": null }, "account": { "id": "3dc38e6606e248a3a5c5aae804578c85", "balance": 68.28, "totalDeposit": 100, "isPseudo": false, "lineOfCredit": 0, "operToken": "742d64bf62eb4ee0be125bfdecb4720a" }, "mgmtDomain": "e12657899f9f43ce8f0f44e70124234e", "description": "日出东方，唯我不败", "binds": {} }, "memberType": { "name": "主人", "showOrder": 0, "style": { "color": "brown" }, "id": "f9b2fc84234b42e382b1bca318fc103d", "discountRule": { "name": "7折", "definition": { "discountFactor": 7 }, "id": "1kha7v7qe3f478g83c4s11ky4" }, "setting": null }, "discounts": [], "remainAmount": 112.47, "sourceid": "mpj/mpos", "master": "9f8e14de7f3b42afb6e8ef8bda96308d" };
    class ttt {
        ctx = DataContextFactory.GetDataContext();

        @Transaction(DataContextFactory.GetDataContext())
        async insertInto() {
            for (let item of orderList) {
                await this.ctx.Create(item);
            }
        }
    }
    before(async () => {
        for (let i = 0; i < 50; i++) {
            let o = new Order();
            o = o.clone(order, o);
            o.id = Guid.GetGuid();

            orderList.push(o);
        }
    })
    it("通过循环批量添加数据", async () => {
        // let ctx = DataContextFactory.GetDataContext();
        // for (let item of orderList) {
        //     await ctx.Create(item);
        // }

        let t = new ttt();
        await t.insertInto();
        assert.ok(true,"error");
    })
})