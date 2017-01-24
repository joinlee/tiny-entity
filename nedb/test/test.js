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
var transcation_1 = require("../../transcation");
var entityObjectNeDB_1 = require("../entityObjectNeDB");
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        return _super.apply(this, arguments) || this;
    }
    User.prototype.toString = function () { return "User"; };
    return User;
}(entityObjectNeDB_1.EntityObjectNeDB));
exports.User = User;
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee() {
        return _super.apply(this, arguments) || this;
    }
    Employee.prototype.toString = function () { return "Employee"; };
    return Employee;
}(entityObjectNeDB_1.EntityObjectNeDB));
var TestDemoDataContext = (function (_super) {
    __extends(TestDemoDataContext, _super);
    function TestDemoDataContext() {
        var _this = _super.call(this, { FilePath: './db/', DBName: "clerkDB.db", IsMulitTabel: true, timestampData: true }) || this;
        _this._user = new User(_this);
        _this._employee = new Employee(_this);
        return _this;
    }
    Object.defineProperty(TestDemoDataContext.prototype, "User", {
        get: function () { return this._user; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestDemoDataContext.prototype, "Employee", {
        get: function () { return this._employee; },
        enumerable: true,
        configurable: true
    });
    return TestDemoDataContext;
}(index_1.NeDBDataContext));
function query() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDemoDataContext();
                    try {
                        t = new tt();
                    }
                    catch (err) {
                        console.log("nmnnnnnnnnnnnnnnnn:" + err);
                        throw new Error(err);
                    }
                    return [4 /*yield*/, ctx.User.First()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var tt = (function () {
    function tt() {
    }
    tt.prototype.xx = function (pp) {
        return __awaiter(this, void 0, void 0, function () {
            var u, r, rr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        u = new User();
                        u.mobile = "15908101316";
                        u.email = "lp@qq.com";
                        u.name = "牛魔王";
                        u.password = "202cb962ac59075b964b07152d234b70";
                        u.id = "3d07e702-d750-46c6-8791-60bc6f76fcc4";
                        return [4 /*yield*/, this.ctx.Create(u)];
                    case 1:
                        r = _a.sent();
                        return [4 /*yield*/, this.ctx.User.First(function (x) { return x.id == "3d07e702-d750-46c6-8791-60bc6f76fcc4"; })];
                    case 2:
                        rr = _a.sent();
                        rr.name = pp;
                        return [4 /*yield*/, this.ctx.Update(rr)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return tt;
}());
__decorate([
    transcation_1.Transaction(new TestDemoDataContext()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], tt.prototype, "xx", null);
function GetGuid() {
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
var list = [];
function CreateTest() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, index, u, index, u, index, ee, count, count2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDemoDataContext();
                    console.time("CreateTest");
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < 1000))
                        return [3 /*break*/, 4];
                    u = new User();
                    u.mobile = "15908101316";
                    u.email = "lp@qq.com";
                    u.name = "牛魔王" + index;
                    u.password = "202cb962ac59075b964b07152d234b70";
                    u.id = GetGuid();
                    return [4 /*yield*/, ctx.Create(u)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4:
                    index = 0;
                    _a.label = 5;
                case 5:
                    if (!(index < 1000))
                        return [3 /*break*/, 8];
                    u = new User();
                    u.mobile = "15908101316";
                    u.email = "lp@qq.com";
                    u.name = "牛魔王" + index;
                    u.password = "202cb962ac59075b964b07152d234b70";
                    u.id = GetGuid();
                    return [4 /*yield*/, ctx.Create(u)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    index++;
                    return [3 /*break*/, 5];
                case 8:
                    index = 0;
                    _a.label = 9;
                case 9:
                    if (!(index < 1000))
                        return [3 /*break*/, 12];
                    ee = new Employee();
                    ee.id = GetGuid();
                    ee.account = "孙悟空" + index;
                    ee.employeeNumber = "xxxx" + index;
                    return [4 /*yield*/, ctx.Create(ee)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    index++;
                    return [3 /*break*/, 9];
                case 12:
                    console.timeEnd("CreateTest");
                    return [4 /*yield*/, ctx.User.Count()];
                case 13:
                    count = _a.sent();
                    return [4 /*yield*/, ctx.Employee.Count()];
                case 14:
                    count2 = _a.sent();
                    console.log(count, count2);
                    return [2 /*return*/];
            }
        });
    });
}
function openDBTest() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, uu, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ctx = new TestDemoDataContext();
                    return [4 /*yield*/, ctx.User.First(function (x) { return x.email == "lp@qq.com"; })];
                case 1:
                    uu = _a.sent();
                    console.log(uu);
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
function updateAndCreateDataTest() {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, u, t, count, f;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = new TestDemoDataContext();
                    u = new User();
                    u.mobile = "15908101316";
                    u.email = "lp@qq.com";
                    u.name = "牛魔王22222";
                    u.password = "202cb962ac59075b964b07152d234b70";
                    u.id = "22222222222222222222222";
                    return [4 /*yield*/, ctx.Update(u)];
                case 1:
                    t = _a.sent();
                    console.log("test finsh");
                    return [4 /*yield*/, ctx.User.Count()];
                case 2:
                    count = _a.sent();
                    console.log("result count ", count);
                    return [4 /*yield*/, ctx.User.First(function (x) { return x.id == "22222222222222222222222"; })];
                case 3:
                    f = _a.sent();
                    console.log(f.name);
                    return [2 /*return*/];
            }
        });
    });
}
updateAndCreateDataTest();
//# sourceMappingURL=test.js.map