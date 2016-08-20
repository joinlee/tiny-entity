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
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const index_1 = require("../index");
const model_1 = require("./model");
class Guid {
    static GetGuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "";
        var uuid = s.join("");
        return uuid;
    }
}
class TestDataContext extends index_1.DataContext {
    constructor() {
        super({
            connectionLimit: 50,
            host: 'localhost',
            user: 'root',
            password: 'onetwo',
            database: 'fbs_db'
        });
        this.employee = new model_1.Employee(this);
        this.order = new model_1.Order(this);
    }
    get Employee() { return this.employee; }
    get Order() { return this.order; }
}
function Test1() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ctx = new TestDataContext();
            let emp = {};
            emp.id = Guid.GetGuid();
            emp.joinTime = new Date();
            emp.account = "likecheng";
            emp.password = "123";
            emp.note = "我是大魔王";
            emp.storeId = Guid.GetGuid();
            emp.employeeNumber = "0001";
            emp.userId = Guid.GetGuid();
            emp.iid = "12312312321";
            let e = index_1.EntityCopier.Copy(emp, new model_1.Employee());
            console.log(e);
            yield ctx.Create(e);
            console.log("success");
        }
        catch (error) {
            console.log(error);
        }
    });
}
function Test2() {
    return __awaiter(this, void 0, void 0, function* () {
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
            };
            let order = index_1.EntityCopier.Copy(od, new model_1.Order());
            console.log(order);
            let r = yield ctx.Create(order);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function Test3() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ctx = new TestDataContext();
            let r = yield ctx.Order.Contains(x => x.id, ['c871cafb03984f8e853be7f6ca351e0e', 'c8d303eaf26249e18837cea2fe9c3b66']);
            console.log(r);
            let r2 = yield ctx.Order.First();
            console.log("select First one:", r2);
            console.log("entity name:", r2.toString());
        }
        catch (error) {
        }
    });
}
function Test4() {
    class TransactionCtx {
        constructor() {
            this.ctx = new TestDataContext();
        }
        TransTest() {
            return __awaiter(this, void 0, void 0, function* () {
                let r1 = yield this.ctx.Employee.First(x => x.id == "1777d5935e8941d885a83659141cf9cd");
                yield this.ctx.Delete(r1);
                let emp = {};
                emp.id = Guid.GetGuid();
                emp.joinTime = new Date();
                emp.account = "likecheng";
                emp.password = "123";
                emp.note = "我是大魔王";
                emp.storeId = Guid.GetGuid();
                emp.employeeNumber = "0001";
                emp.userId = Guid.GetGuid();
                emp.iid = "12312312321";
                let e = index_1.EntityCopier.Copy(emp, new model_1.Employee());
                yield this.ctx.Create(e);
                throw "trnascation error!!!";
            });
        }
    }
    __decorate([
        index_1.Transaction, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], TransactionCtx.prototype, "TransTest", null);
    let t1 = new TransactionCtx();
    t1.TransTest();
}
function Test5() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        ctx.Order.Where(x => x.id == "031623f514694a648dd84d3397239480");
        ctx.Order.Where(x => x.amountDue == -0.01);
        let r = yield ctx.Order.ToList();
        console.log(r.length);
    });
}
// Test1();
// Test2();
// Test3();
// Test4();
Test5();
//# sourceMappingURL=test.js.map