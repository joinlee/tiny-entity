"use strict";
const index_1 = require('../index');
const entityObject_1 = require('../../entityObject');
class Account extends entityObject_1.EntityObject {
    toString() { return "Account"; }
}
class Employee extends entityObject_1.EntityObject {
    toString() { return "Employee"; }
}
class TestDemoDataContext extends index_1.DataContext {
    constructor() {
        super("./clerkDB.db");
        this._account = new Account(this);
        this._employee = new Employee(this);
    }
    get Account() { return this._account; }
    get Employee() { return this._employee; }
}
function query() {
    let ctx = new TestDemoDataContext();
    let nn = "001";
    let r = ctx.Employee.Where(x => x.employeeNumber == nn, ["nn"], [nn]).ToList();
    console.log("employee =====>", r);
    let employee = new Employee();
    employee.account = "jhonlee";
    employee.id = "6207b0fbff284730a1e536e0ebfefc14";
    employee.joinTime = new Date("2016-6-14 17:22");
    employee.password = "202cb962ac59075b964b07152d234b70";
    employee.userId = "3";
    employee.employeeNumber = "003";
    ctx.BeginTranscation();
    let rr = ctx.Create(employee);
    console.log("create result:", rr);
    ctx.Commit();
}
query();
//# sourceMappingURL=entityObj_test.js.map