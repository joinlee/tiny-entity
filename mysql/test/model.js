"use strict";
const index_1 = require("../index");
class Employee extends index_1.EntityObject {
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
class Table extends index_1.EntityObject {
    toString() { return "DeskTable"; }
}
exports.Table = Table;
class TableZone extends index_1.EntityObject {
    toString() { return "TableZone"; }
    clone(source) {
        let r = super.clone(source, new TableZone(), false);
        delete r.tables;
        return r;
    }
}
exports.TableZone = TableZone;
class TableGroup extends index_1.EntityObject {
    toString() { return "TableGroup"; }
}
exports.TableGroup = TableGroup;
/**
 * TableParty 台桌服务记录
 */
class TableParty extends index_1.EntityObject {
    constructor(args) {
        super(args);
        //是否有效台桌使用。例如未就餐的台桌服务为无效台桌服务。开始默认为 true
        this.valid = true;
    }
    toString() { return "TableParty"; }
}
exports.TableParty = TableParty;
class Inventory extends index_1.EntityObject {
    toString() { return "Inventory"; }
}
exports.Inventory = Inventory;
class Category extends index_1.EntityObject {
    toString() { return "Category"; }
}
class Unit extends index_1.EntityObject {
    toString() { return "Units"; }
}
class Modifier extends index_1.EntityObject {
    toString() { return "Modifier"; }
}
class Order extends index_1.EntityObject {
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
class Checkout extends index_1.EntityObject {
    constructor(args) {
        super(args);
        this.amountDue = 0;
        this.remainAmount = 0;
    }
    toString() { return "CheckOuts"; }
}
exports.Checkout = Checkout;
//# sourceMappingURL=model.js.map