"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../index");
var entityObject_1 = require("../../entityObject");
var Account = (function (_super) {
    __extends(Account, _super);
    function Account() {
        return _super.apply(this, arguments) || this;
    }
    Account.prototype.toString = function () { return "Account"; };
    return Account;
}(entityObject_1.EntityObject));
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee() {
        return _super.apply(this, arguments) || this;
    }
    Employee.prototype.toString = function () { return "Employee"; };
    return Employee;
}(entityObject_1.EntityObject));
var TestDemoDataContext = (function (_super) {
    __extends(TestDemoDataContext, _super);
    function TestDemoDataContext() {
        var _this = _super.call(this, "./clerkDB.db") || this;
        _this._account = new Account(_this);
        _this._employee = new Employee(_this);
        return _this;
    }
    Object.defineProperty(TestDemoDataContext.prototype, "Account", {
        get: function () { return this._account; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TestDemoDataContext.prototype, "Employee", {
        get: function () { return this._employee; },
        enumerable: true,
        configurable: true
    });
    return TestDemoDataContext;
}(index_1.SqliteDataContext));
function query() {
    var ctx = new TestDemoDataContext();
    var nn = "001";
    var r = ctx.Employee.Where(function (x) { return x.employeeNumber == nn; }, ["nn"], [nn]).ToList();
    console.log("employee =====>", r);
    var employee = new Employee();
    employee.account = "jhonlee";
    employee.id = "6207b0fbff284730a1e536e0ebfefc14";
    employee.joinTime = new Date("2016-6-14 17:22");
    employee.password = "202cb962ac59075b964b07152d234b70";
    employee.userId = "3";
    employee.employeeNumber = "003";
    ctx.BeginTranscation();
    var rr = ctx.Create(employee);
    console.log("create result:", rr);
    ctx.Commit();
}
query();
//# sourceMappingURL=entityObj_test.js.map