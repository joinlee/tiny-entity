import {  DataContext, EntityObject, EntityCopier } from "../index";
import { Order, Employee} from "./model";
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

class TestDataContext extends DataContext {
    private employee: Employee;
    private order: Order;
    constructor() {
        super({
            connectionLimit: 50,
            host: 'localhost',
            user: 'root',
            password: 'onetwo',
            database: 'fbs_db'
        });
        this.employee = new Employee(this);
        this.order = new Order(this);
    }

    get Employee() { return this.employee; }
    get Order() { return this.order; }
}


async function Test1() {
    try {
        let ctx = new TestDataContext();
        let emp: any = {};
        emp.id = Guid.GetGuid();
        emp.joinTime = new Date();
        emp.account = "likecheng";
        emp.password = "123";
        emp.note = "我是大魔王";
        emp.storeId = Guid.GetGuid();
        emp.employeeNumber = "0001";
        emp.userId = Guid.GetGuid();
        (<any>emp).iid = "12312312321";

        let e = EntityCopier.Copy(emp, new Employee());
        console.log(e);
        await ctx.Create(e);

        console.log("success");
    } catch (error) {
        console.log(error);
    }
}

async function Test2() {
    try {
        let ctx = new TestDataContext();
        let od = {
            amountDue: 0,
            remainAmount: 30,
            cart: {
                items: [
                    {
                        id: "H7BJPKM2HXWLP2347OMEPTS52",
                        price: 28,
                        inventoryId: "8tenakprro08k84ks4kkgs404",
                        inventoryName: "大刀耳片",
                        categories: [
                            {
                                "name": "凉菜",
                                "id": "ba5wtjvwwu0w8os88kcsgs004"
                            }
                        ],
                        qty: 1,
                        modifiers: {
                            items: [
                                {
                                    id: "d4741d3f56fb48c1a8299a8c45271f81",
                                    name: "加料",
                                    options: [
                                        {
                                            name: "加哨子",
                                            price: 2,
                                            id: "6o58uuzsq0ow44w4kc8cowgsk"
                                        }],
                                    amount: 2
                                }],
                            amount: 2
                        },
                        inventoryCode: "ddep",
                        amount: 30
                    }],
                qty: 1
            },
            createTime: 1471266782269,
            creator: {
                id: "weixin",
                name: "weixin"
            },
            discount: 0,
            discounts: [],
            extended: {},
            id: Guid.GetGuid(),
            orderDiscount: 0,
            orderNo: Guid.GetGuid(),
            orderType: "sales",
            paidAmount: 0,
            serialNo: "wx-9",
            smallChangeOff: 0,
            status: "ordered",
            storeId: "1doq6jxo4tdwosgk0s8og0408",
            subtotal: 30,
            terminalName: "wexin",
            sourceid: "mpj/msite/wx-fast"
        }

        let order = EntityCopier.Copy(od, new Order());
        console.log(order);
        let r = await ctx.Create(order);
    } catch (error) {
        console.log(error);
    }

}

async function Test3() {
    try {
        let ctx = new TestDataContext();
        let r =  await ctx.Order.Contains(x => x.id, ['c871cafb03984f8e853be7f6ca351e0e', 'c8d303eaf26249e18837cea2fe9c3b66']);
        console.log(r);
        let r2 = await ctx.Order.First();
        console.log("select First one:",r2);
        console.log("entity name:",r2.toString());
        
    } catch (error) {

    }
}

// Test1();
// Test2();
Test3();