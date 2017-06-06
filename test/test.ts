import { webconfig } from './config';
import { MysqlDataContext } from './../mysql/dataContextMysql';
import { NeDBDataContext } from './../nedb/dataContextNeDB';
import { Table, TableZone, TableGroup, TableParty, Inventory } from './model';
import { Employee, Order } from "./model";
import { IDataContext } from "../index";
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
        let r = await ctx.Table.Join<TableParty>(x => x.tableId, ctx.TableParty).ToList<{ desktable: Table; tableparty: TableParty; }>();
        assert.equal(r.length >= 1, true);
        assert.notEqual(r[0].desktable, null);
        assert.equal(r[0].tableparty, null);
    });

    it("左外连接查询,主表多个数据", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let jr = await ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .GroupBy(x => x.name)
            .ToList<{ desktable: Table; tableparty: TableParty }>();
        assert.notEqual(jr, null);
        assert.equal(jr.length >= 1, true);
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

    it("Join + Contains", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let tablePartyIds = [
            "1111",
            "2222"
        ];

        //let r  = await ctx.
    })
});