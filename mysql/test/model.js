"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var entityObject_1 = require("../../entityObject");
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee(args) {
        var _this = _super.call(this, args) || this;
        _this.id = "";
        _this.account = "";
        _this.employeeNumber = "";
        _this.joinTime = null;
        _this.note = "";
        _this.password = "";
        _this.storeId = "";
        _this.userId = "";
        _this.roles = "";
        return _this;
    }
    Employee.prototype.toString = function () { return "Employee"; };
    return Employee;
}(entityObject_1.EntityObject));
exports.Employee = Employee;
var Table = (function (_super) {
    __extends(Table, _super);
    function Table() {
        return _super.apply(this, arguments) || this;
    }
    Table.prototype.toString = function () { return "DeskTable"; };
    return Table;
}(entityObject_1.EntityObject));
exports.Table = Table;
var TableZone = (function (_super) {
    __extends(TableZone, _super);
    function TableZone() {
        return _super.apply(this, arguments) || this;
    }
    TableZone.prototype.toString = function () { return "TableZone"; };
    TableZone.prototype.clone = function (source) {
        var r = _super.prototype.clone.call(this, source, new TableZone(), false);
        delete r.tables;
        return r;
    };
    return TableZone;
}(entityObject_1.EntityObject));
exports.TableZone = TableZone;
var TableGroup = (function (_super) {
    __extends(TableGroup, _super);
    function TableGroup() {
        return _super.apply(this, arguments) || this;
    }
    TableGroup.prototype.toString = function () { return "TableGroup"; };
    return TableGroup;
}(entityObject_1.EntityObject));
exports.TableGroup = TableGroup;
var TableParty = (function (_super) {
    __extends(TableParty, _super);
    function TableParty(args) {
        var _this = _super.call(this, args) || this;
        _this.valid = true;
        return _this;
    }
    TableParty.prototype.toString = function () { return "TableParty"; };
    return TableParty;
}(entityObject_1.EntityObject));
exports.TableParty = TableParty;
var Inventory = (function (_super) {
    __extends(Inventory, _super);
    function Inventory() {
        return _super.apply(this, arguments) || this;
    }
    Inventory.prototype.toString = function () { return "Inventory"; };
    return Inventory;
}(entityObject_1.EntityObject));
exports.Inventory = Inventory;
var Category = (function (_super) {
    __extends(Category, _super);
    function Category() {
        return _super.apply(this, arguments) || this;
    }
    Category.prototype.toString = function () { return "Category"; };
    return Category;
}(entityObject_1.EntityObject));
var Unit = (function (_super) {
    __extends(Unit, _super);
    function Unit() {
        return _super.apply(this, arguments) || this;
    }
    Unit.prototype.toString = function () { return "Units"; };
    return Unit;
}(entityObject_1.EntityObject));
var Modifier = (function (_super) {
    __extends(Modifier, _super);
    function Modifier() {
        return _super.apply(this, arguments) || this;
    }
    Modifier.prototype.toString = function () { return "Modifier"; };
    return Modifier;
}(entityObject_1.EntityObject));
var Order = (function (_super) {
    __extends(Order, _super);
    function Order(args) {
        var _this = _super.call(this, args) || this;
        _this.id = null;
        _this.amountDue = null;
        _this.cart = null;
        _this.cashier = null;
        _this.checkout = null;
        _this.checkoutMode = null;
        _this.closeTime = null;
        _this.createTime = null;
        _this.creator = null;
        _this.creatorId = null;
        _this.member = null;
        _this.memberType = null;
        _this.discount = null;
        _this.discounts = null;
        _this.headCount = null;
        _this.lastPrintTime = null;
        _this.orderDiscount = null;
        _this.orderNo = null;
        _this.orderType = null;
        _this.paidAmount = null;
        _this.payments = null;
        _this.printCount = null;
        _this.refundAmount = null;
        _this.refundCause = null;
        _this.remainAmount = null;
        _this.serialNo = null;
        _this.refOrderId = null;
        _this.smallChangeOff = null;
        _this.status = null;
        _this.storeId = null;
        _this.subtotal = null;
        _this.terminalName = null;
        _this.total = null;
        _this.sourceid = null;
        _this.processStatus = null;
        _this.extended = null;
        return _this;
    }
    Order.prototype.toString = function () { return "Orders"; };
    return Order;
}(entityObject_1.EntityObject));
exports.Order = Order;
var Checkout = (function (_super) {
    __extends(Checkout, _super);
    function Checkout(args) {
        var _this = _super.call(this, args) || this;
        _this.amountDue = 0;
        _this.remainAmount = 0;
        return _this;
    }
    Checkout.prototype.toString = function () { return "CheckOuts"; };
    return Checkout;
}(entityObject_1.EntityObject));
exports.Checkout = Checkout;
//# sourceMappingURL=model.js.map