"use strict";
const config_1 = require("./config");
let EntityObject = config_1.EntityObjectFactory.GetEntityObjectType();
class Employee extends EntityObject {
    constructor(args) {
        super(args);
        this.id = "";
        this.account = "";
        this.employeeNumber = "";
        this.joinTime = null;
        this.note = "";
        this.password = "";
        this.storeId = "";
        this.userId = "";
        this.roles = "";
    }
    toString() { return "Employee"; }
}
exports.Employee = Employee;
class Table extends EntityObject {
    constructor() {
        super(...arguments);
        this.id = null;
        this.name = null;
        this.capacity = null;
        this.zone = null;
        this.storeId = null;
        this.showOrder = null;
        this.status = null;
    }
    toString() { return "DeskTable"; }
}
exports.Table = Table;
class TableZone extends EntityObject {
    toString() { return "TableZone"; }
    clone(source) {
        let r = super.clone(source, new TableZone(), false);
        delete r.tables;
        return r;
    }
}
exports.TableZone = TableZone;
class TableGroup extends EntityObject {
    toString() { return "TableGroup"; }
}
exports.TableGroup = TableGroup;
class TableParty extends EntityObject {
    constructor(args) {
        super(args);
        this.id = null;
        this.storeId = null;
        this.tableId = null;
        this.tableName = null;
        this.tableGroupId = null;
        this.status = null;
        this.orderId = null;
        this.valid = true;
    }
    toString() { return "TableParty"; }
}
exports.TableParty = TableParty;
class Inventory extends EntityObject {
    toString() { return "Inventory"; }
}
exports.Inventory = Inventory;
class Category extends EntityObject {
    toString() { return "Category"; }
}
class Unit extends EntityObject {
    toString() { return "Units"; }
}
class Modifier extends EntityObject {
    toString() { return "Modifier"; }
}
class Order extends EntityObject {
    constructor(args) {
        super(args);
        this.id = null;
        this.amountDue = null;
        this.cart = null;
        this.cashier = null;
        this.checkout = null;
        this.checkoutMode = null;
        this.closeTime = null;
        this.createTime = null;
        this.creator = null;
        this.creatorId = null;
        this.member = null;
        this.memberType = null;
        this.discount = null;
        this.discounts = null;
        this.headCount = null;
        this.lastPrintTime = null;
        this.orderDiscount = null;
        this.orderNo = null;
        this.orderType = null;
        this.paidAmount = null;
        this.payments = null;
        this.printCount = null;
        this.refundAmount = null;
        this.refundCause = null;
        this.remainAmount = null;
        this.serialNo = null;
        this.refOrderId = null;
        this.smallChangeOff = null;
        this.status = null;
        this.storeId = null;
        this.subtotal = null;
        this.terminalName = null;
        this.total = null;
        this.sourceid = null;
        this.processStatus = null;
        this.extended = null;
    }
    toString() { return "Orders"; }
}
exports.Order = Order;
class Checkout extends EntityObject {
    constructor(args) {
        super(args);
        this.amountDue = 0;
        this.remainAmount = 0;
    }
    toString() { return "CheckOuts"; }
}
exports.Checkout = Checkout;
//# sourceMappingURL=model.js.map