import { NeDBDataContext } from '../index';
import { Transaction } from "../../transcation";
import { EntityObjectNeDB } from "../entityObjectNeDB";

export class User extends EntityObjectNeDB<User> {
    account: string;
    mobile: string;
    email: string;
    name: string;
    pic: string;
    password: string;
    userId: string;
    description: string;
    registeredTime: Date
    toString(): string { return "User"; }
}

class Employee extends EntityObjectNeDB<Employee> {
    account: string;
    employeeNumber: string;
    joinTime: Date;
    note: string;
    password: string;
    storeId: string;
    userId: string;
    roles: string;
    toString(): string { return "Employee"; }
}

class TestDemoDataContext extends NeDBDataContext {
    private _user: User;
    private _employee: Employee;

    constructor() {
        super({ FilePath: './db/', DBName: "clerkDB.db", IsMulitTabel: true, timestampData: true });
        this._user = new User(this);
        this._employee = new Employee(this);
    }
    get User() { return this._user; }
    get Employee() { return this._employee; }
}


async function query() {
    let ctx = new TestDemoDataContext();

    try {
        let t = new tt();
        //await t.xx("123")
    }
    catch (err) {
        console.log("nmnnnnnnnnnnnnnnnn:" + err);

        throw new Error(err);
    }

    await ctx.User.First();

    // let t = new tt();
    // await t.xx("123")
}

class tt {
    ctx: TestDemoDataContext;

    @Transaction(new TestDemoDataContext())
    async xx(pp: string) {
        let u = new User();
        u.mobile = "15908101316";
        u.email = "lp@qq.com";
        u.name = "牛魔王";
        u.password = "202cb962ac59075b964b07152d234b70";
        u.id = "3d07e702-d750-46c6-8791-60bc6f76fcc4";

        let r = await this.ctx.Create(u);
        let rr = await this.ctx.User.First(x => x.id == "3d07e702-d750-46c6-8791-60bc6f76fcc4");
        rr.name = pp;
        await this.ctx.Update(rr);

        //await this.ctx.Delete(rr);

        // throw "人为抛出异常xx（）方法";
    }
}

// let t = new tt();
// t.xx("cvfff");


// query();

function GetGuid(): string {
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

// import {DataSyncAddEventHandler, DataSyncEventListener }  from "../dataSyncEventListener";

let list = [];
async function CreateTest() {
    let ctx = new TestDemoDataContext();
    console.time("CreateTest");
    for (let index = 0; index < 1000; index++) {
        let u = new User();
        u.mobile = "15908101316";
        u.email = "lp@qq.com";
        u.name = "牛魔王" + index;
        u.password = "202cb962ac59075b964b07152d234b70";
        u.id = GetGuid();

        await ctx.Create(u);
        // list.push({ isop: false, obj: u });
        // DataSyncEventListener.Current.OnAddDataSyncEvent(null, u);
    }

    for (let index = 0; index < 1000; index++) {
        let u = new User();
        u.mobile = "15908101316";
        u.email = "lp@qq.com";
        u.name = "牛魔王" + index;
        u.password = "202cb962ac59075b964b07152d234b70";
        u.id = GetGuid();

        await ctx.Create(u);
        // list.push({ isop: false, obj: u });
        // DataSyncEventListener.Current.OnAddDataSyncEvent(null, u);
    }

    for (let index = 0; index < 1000; index++) {
        // let u = new User();
        // u.mobile = "15908101316";
        // u.email = "lp@qq.com";
        // u.name = "孙悟空" + index;
        // u.password = "202cb962ac59075b964b07152d234b70";
        // u.id = GetGuid();

        //await ctx.Create(u);
        // list.push({ isop: false, obj: u });
        // DataSyncEventListener.Current.OnAddDataSyncEvent(null, u);

        let ee = new Employee();
        ee.id = GetGuid();
        ee.account = "孙悟空" + index;
        ee.employeeNumber = "xxxx" + index;
        await ctx.Create(ee);
    }

    console.timeEnd("CreateTest");
    let count = await ctx.User.Count();
    let count2 = await ctx.Employee.Count();
    console.log(count, count2);

}

CreateTest();

async function openDBTest() {
    try {
        let ctx = new TestDemoDataContext();
        // let u = new User();
        // u.mobile = "15908101316";
        // u.email = "lp@qq.com";
        // u.name = "牛魔王1";
        // u.password = "202cb962ac59075b964b07152d234b70";
        // u.id = "3d07e702-d750-46c6-8791-60bc6f76fcc4";

        // let r = await ctx.Create(u);
        // console.log(r);

        let uu = await ctx.User.First(x => x.email == "lp@qq.com");
        console.log(uu);
    } catch (error) {
        console.log(error);
    }

}



// openDBTest();


async function updateAndCreateDataTest() {
    let ctx = new TestDemoDataContext();

    let u = new User();
    u.mobile = "15908101316";
    u.email = "lp@qq.com";
    u.name = "牛魔王2222222";
    u.password = "202cb962ac59075b964b07152d234b70";
    u.id = "22222222222222222222222";

    let t = await ctx.Update(u);

    console.log("test finsh");

    let count = await ctx.User.Count();
    console.log("result count ", count);
}


// updateAndCreateDataTest();







