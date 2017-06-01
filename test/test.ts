import { webconfig } from './config';
import { MysqlDataContext } from './../mysql/dataContextMysql';
import { NeDBDataContext } from './../nedb/dataContextNeDB';
import { Table, TableZone, TableGroup, TableParty, Inventory } from './model';
import { Employee } from "./model";
import { IDataContext } from "../index";
import * as assert from "assert";

interface FBSDataContextBase extends IDataContext {
    Employee: Employee;
    Table: Table;
    TableGroup: TableGroup;
    TableZone: TableZone;
    TableParty: TableParty;
    Inventory: Inventory;
}
class FBSDataContextNeDB extends NeDBDataContext implements FBSDataContextBase {
    private employee: Employee;
    private table: Table;
    private tableGroup: TableGroup;
    private tableZone: TableZone;
    private tableParty: TableParty;
    private inventory: Inventory;

    constructor() {
        super({ FilePath: webconfig.dataRootDir + "/", DBName: "", IsMulitTabel: true });

        this.employee = new Employee(this);
        this.table = new Table(this);
        this.tableGroup = new TableGroup(this);
        this.tableZone = new TableZone(this);
        this.tableParty = new TableParty(this);
        this.inventory = new Inventory(this);
    }

    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }

}
class FBSDataContextMysql extends MysqlDataContext implements FBSDataContextBase {
    private employee: Employee;
    private table: Table;
    private tableGroup: TableGroup;
    private tableZone: TableZone;
    private tableParty: TableParty;
    private inventory: Inventory;

    constructor() {
        super(webconfig.mysqlConnOption);

        this.employee = new Employee(this);
        this.table = new Table(this);
        this.tableGroup = new TableGroup(this);
        this.tableZone = new TableZone(this);
        this.tableParty = new TableParty(this);
        this.inventory = new Inventory(this);
    }

    get Employee() { return this.employee; }
    get Table() { return this.table; }
    get TableGroup() { return this.tableGroup; }
    get TableZone() { return this.tableZone; }
    get TableParty() { return this.tableParty; }
    get Inventory() { return this.inventory; }
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

describe("ToList", () => {
    before(async () => {
        // 在本区块的所有测试用例之前执行
        let ctx = DataContextFactory.GetDataContext();
        let has = await ctx.Table.Any(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728");
        if (!has) {
            let table = new Table();
            table.id = "a66fcbd29d2b4ac683c57520bfca5728";
            table.name = "测试台桌1";
            table.status = "opening";

            let tableParty = new TableParty();
            tableParty.id = Guid.GetGuid();
            tableParty.tableId = table.id;
            tableParty.openedTime = new Date().getTime();
            tableParty.status = "opening";

            await ctx.Create(table);
            await ctx.Create(tableParty);
        }
    })
    it("左外连接查询,主表单个数据", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let jr = await ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .Where(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728")
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .Take(1)
            .ToList<{ desktable: Table; tableparty: TableParty }>();
        assert.notEqual(jr, null);
        assert.equal(jr.length, 1);
        assert.equal(jr[0].desktable.id, "a66fcbd29d2b4ac683c57520bfca5728");

        if (jr[0].tableparty) {
            assert.equal(jr[0].tableparty.tableId, "a66fcbd29d2b4ac683c57520bfca5728");
        }
        else {
            //左表没有数据的情况
            assert.equal(jr[0].tableparty, null);
        }

    })

    it("左外连接查询,主表多个数据", async () => {
        let ctx = DataContextFactory.GetDataContext();
        let jr = await ctx.Table
            .Join(x => x.tableId, ctx.TableParty)
            .OrderByDesc(x => x.openedTime, ctx.TableParty)
            .GroupBy(x => x.name)
            .ToList<{ desktable: Table; tableparty: TableParty }>();
        assert.notEqual(jr, null);
        assert.equal(jr.length, 158);
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
        let tableId = "a66fcbd29d2b4ac683c57520bfca5728";
        let r = await ctx.Table.Where(x => x.id == tableId, ["tableId"], [tableId]).ToList();
        assert.notEqual(r, null);
        assert.equal(r.length == 1, true);
        assert.equal(r[0].id, "a66fcbd29d2b4ac683c57520bfca5728");
    })
});