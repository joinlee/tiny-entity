"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var index_1 = require("../index");
var model_1 = require("./model");
var entityCopier_1 = require("../../entityCopier");
var transcation_1 = require("../../transcation");
var Guid = (function () {
    function Guid() {
    }
    Guid.GetGuid = function () {
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
    };
    return Guid;
}());
var TestDataContext = (function (_super) {
    __extends(TestDataContext, _super);
    function TestDataContext() {
        var _this = _super.call(this, {
            connectionLimit: 50,
            host: 'localhost',
            user: 'root',
            password: 'onetwo',
            database: 'fbs_db'
        }) || this;
        _this.employee = new model_1.Employee(_this);
        _this.order = new model_1.Order(_this);
        return _this;
    }
    Object.defineProperty(TestDataContext.prototype, "Employee", {
        get: function () { return this.employee; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestDataContext.prototype, "Order", {
        get: function () { return this.order; },
        enumerable: true,
        configurable: true
    });
    return TestDataContext;
}(index_1.MysqlDataContext));
function Test1() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, emp, e, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx = new TestDataContext();
                    emp = {};
                    emp.id = Guid.GetGuid();
                    emp.joinTime = new Date();
                    emp.account = "likecheng";
                    emp.password = "123";
                    emp.note = "我是大魔王";
                    emp.storeId = Guid.GetGuid();
                    emp.employeeNumber = "0001";
                    emp.userId = Guid.GetGuid();
                    emp.iid = "12312312321";
                    e = entityCopier_1.EntityCopier.Copy(emp, new model_1.Employee());
                    console.log(e);
                    return [4 /*yield*/, ctx.Create(e)];
                case 1:
                    _a.sent();
                    console.log("success");
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function Test2() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, od, order, r, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx = new TestDataContext();
                    od = {
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
                    order = entityCopier_1.EntityCopier.Copy(od, new model_1.Order());
                    console.log(order);
                    return [4 /*yield*/, ctx.Create(order)];
                case 1:
                    r = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.log(error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function Test3() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, r, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx = new TestDataContext();
                    return [4 /*yield*/, ctx.Order.First(function (x) { return x.id == "c98ad2a9afed42dd8299fb4983734316"; })];
                case 1:
                    r = _a.sent();
                    console.log(r);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function Test4() {
    var TransactionCtx = (function () {
        function TransactionCtx() {
            this.ctx = new TestDataContext();
        }
        TransactionCtx.prototype.TransTest = function () {
            return __awaiter(this, void 0, void 0, function () {
                var r1, emp, e;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ctx.Employee.First(function (x) { return x.id == "1777d5935e8941d885a83659141cf9cd"; })];
                        case 1:
                            r1 = _a.sent();
                            return [4 /*yield*/, this.ctx.Delete(r1)];
                        case 2:
                            _a.sent();
                            emp = {};
                            emp.id = Guid.GetGuid();
                            emp.joinTime = new Date();
                            emp.account = "likecheng";
                            emp.password = "123";
                            emp.note = "我是大魔王";
                            emp.storeId = Guid.GetGuid();
                            emp.employeeNumber = "0001";
                            emp.userId = Guid.GetGuid();
                            emp.iid = "12312312321";
                            e = entityCopier_1.EntityCopier.Copy(emp, new model_1.Employee());
                            return [4 /*yield*/, this.ctx.Create(e)];
                        case 3:
                            _a.sent();
                            throw "trnascation error!!!";
                    }
                });
            });
        };
        return TransactionCtx;
    }());
    __decorate([
        transcation_1.Transaction(new TestDataContext()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], TransactionCtx.prototype, "TransTest", null);
    var t1 = new TransactionCtx();
    t1.TransTest();
}
function Test5() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, r, r1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDataContext();
                    ctx.Order.Where(function (x) { return x.id == "031623f514694a648dd84d3397239480"; });
                    ctx.Order.Where(function (x) { return x.amountDue == -0.01; });
                    return [4 /*yield*/, ctx.Order.ToList()];
                case 1:
                    r = _a.sent();
                    console.log(r.length);
                    return [4 /*yield*/, ctx.Order.Where(function (x) { return x.id == "031623f514694a648dd84d3397239480" || x.amountDue == -0.01; }).ToList()];
                case 2:
                    r1 = _a.sent();
                    console.log(r1.length);
                    return [2 /*return*/];
            }
        });
    });
}
function Test6() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDataContext();
                    ctx.Order.Where(function (x) { return x.amountDue != -0.01; });
                    ctx.Order.Contains(function (x) { return x.status; }, ["closed", "refund"]);
                    return [4 /*yield*/, ctx.Order.Select(function (x) { return x.id; }).ToList()];
                case 1:
                    r = _a.sent();
                    console.log(r.length);
                    return [2 /*return*/];
            }
        });
    });
}
function Test7() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, o, oo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDataContext();
                    o = {
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
                    oo = entityCopier_1.EntityCopier.Copy(o, new model_1.Order());
                    console.log(oo);
                    return [4 /*yield*/, ctx.Create(oo)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
Test3();
//# sourceMappingURL=test.js.map