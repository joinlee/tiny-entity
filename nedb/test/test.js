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
const transcation_1 = require("../../transcation");
const entityObjectNeDB_1 = require("../entityObjectNeDB");
class User extends entityObjectNeDB_1.EntityObjectNeDB {
    toString() { return "User"; }
}
exports.User = User;
class Employee extends entityObjectNeDB_1.EntityObjectNeDB {
    toString() { return "Employee"; }
}
class TestDemoDataContext extends index_1.NeDBDataContext {
    constructor() {
        super({ FilePath: './db/', DBName: "clerkDB.db", IsMulitTabel: true, timestampData: true });
        this._user = new User(this);
        this._employee = new Employee(this);
    }
    get User() { return this._user; }
    get Employee() { return this._employee; }
}
function query() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDemoDataContext();
        try {
            let t = new tt();
        }
        catch (err) {
            console.log("nmnnnnnnnnnnnnnnnn:" + err);
            throw new Error(err);
        }
        yield ctx.User.First();
    });
}
class tt {
    xx(pp) {
        return __awaiter(this, void 0, void 0, function* () {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "牛魔王";
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = "3d07e702-d750-46c6-8791-60bc6f76fcc4";
            let r = yield this.ctx.Create(u);
            let rr = yield this.ctx.User.First(x => x.id == "3d07e702-d750-46c6-8791-60bc6f76fcc4");
            rr.name = pp;
            yield this.ctx.Update(rr);
        });
    }
}
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
let list = [];
function CreateTest() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDemoDataContext();
        console.time("CreateTest");
        for (let index = 0; index < 1000; index++) {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "牛魔王" + index;
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = GetGuid();
            yield ctx.Create(u);
        }
        for (let index = 0; index < 1000; index++) {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "牛魔王" + index;
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = GetGuid();
            yield ctx.Create(u);
        }
        for (let index = 0; index < 1000; index++) {
            let ee = new Employee();
            ee.id = GetGuid();
            ee.account = "孙悟空" + index;
            ee.employeeNumber = "xxxx" + index;
            yield ctx.Create(ee);
        }
        console.timeEnd("CreateTest");
        let count = yield ctx.User.Count();
        let count2 = yield ctx.Employee.Count();
        console.log(count, count2);
    });
}
function openDBTest() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let ctx = new TestDemoDataContext();
            let uu = yield ctx.User.First(x => x.email == "lp@qq.com");
            console.log(uu);
        }
        catch (error) {
            console.log(error);
        }
    });
}
function updateAndCreateDataTest() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDemoDataContext();
        let u = new User();
        u.mobile = "15908101316";
        u.email = "lp@qq.com";
        u.name = "牛魔王22222";
        u.password = "202cb962ac59075b964b07152d234b70";
        u.id = "22222222222222222222222";
        let t = yield ctx.Update(u);
        console.log("test finsh");
        let count = yield ctx.User.Count();
        console.log("result count ", count);
        let f = yield ctx.User.First(x => x.id == "22222222222222222222222");
        console.log(f.name);
    });
}
updateAndCreateDataTest();
//# sourceMappingURL=test.js.map