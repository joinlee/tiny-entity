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
    let ctx = DataContextFactory.GetDataContext();
    let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
    before(async () => {
        // 在本区块的所有测试用例之前执行
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
        assert.equal(r[0].desktable.toString().toLocaleLowerCase(), table.toString().toLocaleLowerCase(), r[0].desktable.toString() + " toString() must be " + table.toString());
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
    after(async () => {
        await ctx.DeleteAll(new Table());
        await ctx.DeleteAll(new Order());
        await ctx.DeleteAll(new TableParty());
    })
});

describe("Join", () => {
    let ctx = DataContextFactory.GetDataContext();
    let mockDatas = {
        tableList: [],
        tableParties: [],
        orders: []
    };
    before(async () => {
        //构造数据
        for (let i = 0; i < 3; i++) {
            let order = new Order();
            order.id = Guid.GetGuid();
            order.amountDue = 100;

            await ctx.Create(order);
            mockDatas.orders.push(order);

            let table = new Table();
            table.id = Guid.GetGuid();
            table.name = "TESTTABLE1";
            await ctx.Create(table);
            mockDatas.tableList.push(table);

            let tableParty = new TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = table.id;
            tableParty.orderId = order.id;
            await ctx.Create(tableParty);
            mockDatas.tableParties.push(tableParty);
        }
    })

    it("JOIN Three Table", async () => {
        let r = await ctx.TableParty
            .Join<Table>(x => x.id, ctx.Table, "tableId", true)
            .Join<Order>(x => x.id, ctx.Order, "orderId", true)
            .ToList<{ tableparty: TableParty; desktable: Table; orders: Order; }>();
        assert.equal(r.length, 3, "");
        assert.notEqual(mockDatas.orders.find(x => x.id == r[0].orders.id), null, "");
        assert.notEqual(mockDatas.tableParties.find(x => x.id == r[1].tableparty.id), null, "");
        assert.notEqual(mockDatas.tableList.find(x => x.name == r[2].desktable.name), null, "");
    })
    it("use Join and Take", async () => {
        let r = await ctx.TableParty
            .Join<Table>(x => x.id, ctx.Table, "tableId", true)
            .Join<Order>(x => x.id, ctx.Order, "orderId", true)
            .Take(1)
            .ToList<{ tableparty: TableParty; desktable: Table; orders: Order; }>();
        assert.equal(r.length, 1, "");
    })
    after(async () => {
        await ctx.DeleteAll(new Table());
        await ctx.DeleteAll(new Order());
        await ctx.DeleteAll(new TableParty());
    })
});

describe("Contains", () => {
    let ctx = DataContextFactory.GetDataContext();
    let tableIds = [];
    before(async () => {
        // 构造台桌
        for (let i = 0; i < 2; i++) {
            let table = new Table();
            table.id = Guid.GetGuid();
            table.name = "TESTTABLE" + i;

            tableIds.push(table.id);

            await ctx.Create(table);
        }
    })
    it("only use contains function", async () => {
        let r = await ctx.Table.Contains(x => x.id, tableIds).ToList();
        assert.equal(r.length, 2, "r.length must be 2");
        assert.notEqual(r.find(x => x.id == tableIds[0]), null, "");
        assert.notEqual(r.find(x => x.id == tableIds[1]), null, "");
    })
    after(async () => {
        // 清空台桌表
        await ctx.DeleteAll(new Table());
    })
});

describe("左外连接都是链接主表", () => {
    before(async () => {

    })
    it("左外连接都是链接主表")
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

describe("transcation", () => {
    class TestService {
        ctx: FBSDataContextBase;

        @Transaction(DataContextFactory.GetDataContext())
        async Action1() {
            let emp = new Employee();
            emp.id = Guid.GetGuid();
            emp.storeId = "testStore";
            emp.employeeNumber = "likecheng";

            let e = await this.ctx.Create(emp);
            this.Action2();
        }

        @Transaction(DataContextFactory.GetDataContext())
        async Action2() {
            let emp = new Employee();
            emp.id = Guid.GetGuid();
            emp.storeId = "testStore";
            emp.employeeNumber = "likecheng2";

            await this.ctx.Create(emp);
            // throw "this is a exception!";
        }

    }

    it("transcation on", async () => {
        let svr = new TestService();
        try {
            await svr.Action1();
            let ctx = DataContextFactory.GetDataContext();
            let list = await ctx.Employee.Where(x => x.storeId == "testStore").ToList();
            assert.equal(list.length == 0, "transaction error！");
        }
        catch (error) {
            console.log(error);
        }
    });
    after(async () => {
        let ctx = DataContextFactory.GetDataContext();
        let list = await ctx.Employee.Where(x => x.storeId == "testStore").ToList();
        for (let item of list) {
            await ctx.Delete(item);
        }
    })
});

describe("查询字段是NUll的情况", () => {
    let table: Table;
    before(async () => {
        let ctx = DataContextFactory.GetDataContext();
        table = new Table();
        table.id = Guid.GetGuid();
        table.name = "测试台桌";

        await ctx.Create(table);
    })

    it("查询字段是NUll 情况", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let tableResult = await ctx.Table.Where(x => x.status == null && x.name == table.name, ["table.name"], [table.name]).ToList();

        assert.equal(tableResult.length, 1, "ableResult.length must be 1");
    })

    after(async () => {
        let ctx = DataContextFactory.GetDataContext();
        // clean data;
        await ctx.Delete(table);
    })
})