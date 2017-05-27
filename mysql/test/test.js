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
const index_1 = require("../index");
const model_1 = require("./model");
const entityCopier_1 = require("../../entityCopier");
const transcation_1 = require("../../transcation");
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
            let e = entityCopier_1.EntityCopier.Copy(emp, new model_1.Employee());
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
                                            }
                                        ],
                                        amount: 2
                                    }
                                ],
                                amount: 2
                            },
                            inventoryCode: "ddep",
                            amount: 30
                        }
                    ],
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
            let order = entityCopier_1.EntityCopier.Copy(od, new model_1.Order());
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
            console.time("ddddddd");
            let jr = yield ctx.Table.Join(ctx.TableParty, x => x.tableId).Where(x => x.id == "a66fcbd29d2b4ac683c57520bfca5728").ToList();
            console.log(jr[0]);
            console.timeEnd("ddddddd");
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
                let e = entityCopier_1.EntityCopier.Copy(emp, new model_1.Employee());
                yield this.ctx.Create(e);
                throw "trnascation error!!!";
            });
        }
    }
    __decorate([
        transcation_1.Transaction(new TestDataContext()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
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
        let r1 = yield ctx.Order.Where(x => x.id == "031623f514694a648dd84d3397239480" || x.amountDue == -0.01).ToList();
        console.log(r1.length);
    });
}
function Test6() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        ctx.Order.Where(x => x.amountDue != -0.01);
        ctx.Order.Contains(x => x.status, ["closed", "refund"]);
        let r = yield ctx.Order.Select(x => x.id).ToList();
        console.log(r.length);
    });
}
function Test7() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDataContext();
        let o = {
            "sqlTemp": [],
            "queryParam": {},
            "amountDue": 28,
            "remainAmount": 28,
            "id": "123095d3787c4a648a0814e18be1b74e",
            "storeId": "1doq6jxo4tdwosgk0s8og0408",
            "terminalName": "wexin",
            "createTime": 1471859159539,
            "payments": [
                {
                    "id": "8008123001201608030483940039",
                    "channel": "wechat-pay",
                    "channelId": "wechat-pay",
                    "amount": 28,
                    "storeId": "1doq6jxo4tdwosgk0s8og0408",
                    "received": 28,
                    "payMode": "pay",
                    "createTime": "1471402710081",
                    "extended": {
                        "trade_type": "JSAPI"
                    }
                }
            ],
            "paidAmount": 28,
            "payState": "paid",
            "closeTime": 1471859447038
        };
        let oo = entityCopier_1.EntityCopier.Copy(o, new model_1.Order());
        console.log(oo);
        yield ctx.Create(oo);
    });
}
Test3();
//# sourceMappingURL=test.js.map