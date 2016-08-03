import { DataContext, EntityObject } from '../index';
import { Assert } from './assert';

class Account extends EntityObject<Account> {
    UserName: string;
    Password: string;
    toString(): string { return "Account"; }
}

function log(target, propertyKey: string, descriptor: PropertyDescriptor) {

}

class Employee extends EntityObject<Employee> {
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

class TestDemoDataContext extends DataContext {
    private _account: Account;
    private _employee: Employee;

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
    let nn = "001"
    let r = ctx.Employee.Where(x => x.employeeNumber == nn, ["nn"], [nn]).ToList();
    console.log("employee =====>", r[0].account);
    // //ctx.Employee.Count();

    // let count = ctx.Employee.Count(x=>x.employeeNumber == "001");

    // console.log("count ====>" ,count);

    // console.log("any ===>",ctx.Employee.Any(x=>x.employeeNumber == "002"));
    // console.log("First ===>",ctx.Employee.First());
    //ctx.Employee.OrderBy(x=>x.account).ToList();

    // var r = ctx.Employee
    // .Where(x => x.account == "lkc")
    // .Select(x => x.account && x.password)
    // .Count();
    // console.log(r);

    let employee = new Employee();
    employee.account = "jhonlee";
    employee.id = "6207b0fbff284730a1e536e0ebfefc11";
    employee.joinTime = new Date("2016-6-14 17:22"); //"2016-6-14 17:22";
    employee.password = "202cb962ac59075b964b07152d234b70";
    employee.userId = "3";
    employee.employeeNumber = "003";

    //ctx.BeginTranscation();
    //ctx.Create(employee);
    //ctx.Commit();

    //ctx.Update()

    // let ac = "lkc";
    // var r = ctx.Employee.Where(x => x.account == "lkc").Select(x => x.account).ToList();

    console.log(r);
}

query();

