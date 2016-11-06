import { DataContext, EntityCopier } from "../index";
import { EntityObject } from "../../entityObject";

export class Employee extends EntityObject<Employee> {
    constructor(args?) {
        super(args);
    }
    id: string = "";
    account: string = "";
    employeeNumber: string = "";
    joinTime: Date = null;
    note: string = "";
    password: string = "";
    storeId: string = "";
    userId: string = "";
    roles: string = "";
    toString(): string { return "Employee"; }
}

export class Table extends EntityObject<Table>{
    // 台桌名
    name: string;
    //座位数
    capacity: number;
    //分区
    zone: any;
    //店铺id
    storeId: string | number;
    //排序字段
    showOrder;
    //当前台桌状态 free空闲 / opening 使用中 / reserved 预留 / settled 已结算未关台
    status: string;

    toString(): string { return "DeskTable"; }
}
export class TableZone extends EntityObject<TableZone>{
    //台桌分区
    name: string;
    //分区样式定义
    style;
    //店铺id
    storeId: string | number;
    toString(): string { return "TableZone"; }
    clone(source) {
        let r = super.clone(source, new TableZone(), false);
        delete (r as any).tables;
        return r;
    }
}
export class TableGroup extends EntityObject<TableGroup> {
    //店铺id
    storeId: string | number;
    toString(): string { return "TableGroup"; }
}
/**
 * TableParty 台桌服务记录
 */
export class TableParty extends EntityObject<TableParty>{
    constructor(args?) {
        super(args);
    }
    //店铺id
    storeId: string | number;
    //台桌ID
    tableId: string | number;
    tableName: string;
    //加入合并台桌id。null表示独立台桌
    tableGroupId: string;
    //开台时间
    openedTime: Date | string;
    //关台时间
    closedTime: Date | string;
    // opening 使用中 closed 台桌已经关闭停止服务  settled: 已经结算状态
    status: string;
    //订单号
    orderId: string | number;
    //是否有效台桌使用。例如未就餐的台桌服务为无效台桌服务。开始默认为 true
    valid: boolean = true;
    toString(): string { return "TableParty"; }
}
export class Inventory extends EntityObject<Inventory>{
    categories: Category[];
    //商品名称
    name: string;
    //图片
    pic: string;
    //商品分类
    categoryIds;
    price: number;
    //商品代码
    code: string;
    //规格
    model: string;
    //材质
    material: string;
    //单位
    unit: Unit;
    unitId: string;
    //颜色
    color: string;
    //产地
    madein: string;
    //描述
    description: string;
    //检索码
    searchCode: string;
    //上架下架
    onsale: boolean;
    //会员价格定义：json对象
    memberPrices: any;
    //商品选项
    modifiers: Modifier[];

    toString() { return "Inventory"; }
}
class Category extends EntityObject<Category> {
    name: string;
    showOrder: number;
    parent: Category;
    store: any;
    toString() { return "Category"; }
}
class Unit extends EntityObject<Unit>{
    storeId: string;
    toString() { return "Units"; }
}
class Modifier extends EntityObject<Modifier> {
    applyCategories: Category[];
    isGeneral: boolean;
    isRequired: boolean;
    name: string;
    singleton: boolean;
    storeId: string;
    options: [any];
    toString() { return "Modifier"; }
}
export class Order extends EntityObject<Order> {
    constructor(args?) {
        super(args);
    }
    id: string = null;
    amountDue: number = null;
    cart: Cart = null;
    cashier = null;
    checkout: Checkout = null;
    checkoutMode: string = null;
    closeTime: number = null;
    createTime: number = null;
    creator: { id: string, name: string } = null;
    creatorId: string = null;
    member = null;
    memberType = null;
    discount: number = null;
    discounts: Array<any> = null;
    headCount: number = null;
    lastPrintTime: number = null;
    orderDiscount: number = null;
    orderNo: string = null;
    orderType: string = null;
    paidAmount: number = null;
    payments: Payments[] = null;
    printCount = null;
    refundAmount: number = null;
    refundCause: string = null;
    remainAmount: number = null;
    serialNo: string = null;
    refOrderId = null;
    smallChangeOff: number = null;
    status: string = null;
    storeId: string = null;
    subtotal: number = null;
    terminalName: string = null;
    total: number = null;
    sourceid: string = null;
    processStatus: ProcessStatus = null;
    extended: OrderExtended = null;
    toString() { return "Orders"; }
}

export class Checkout extends EntityObject<Checkout> {
    constructor(args?) {
        super(args);
    }
    id: string;
    amountDue: number = 0;
    cashier: { id: string, name: string };
    cashierId: string;
    paidAmount: number;
    remainAmount: number = 0;
    storeId: string;
    payState: string;
    payments: Payments[];
    terminalName: string;
    terminal: { id: string, name: string };
    refOrderId: { id: string, type: string }[];

    toString(): string { return "CheckOuts"; }
}

export interface Cart {
    items: CartItem[];
    qty: number;
}
interface CartItem {
    amount: number;
    discount: number;
    extended: CartItemExtend;
    id;
    inventory: Inventory;
    inventoryCode: string;
    inventoryId: string;
    inventoryName: string;
    isEntireDiscount: boolean;
    price: number;
    qty: number;
    showOrder: number;
    total: number;
}
interface CartItemExtend {
    dishup: DisHup;
}
interface DisHup {
    operateTime: Date;
    operator: { id: string, name: string };
    operatorId: string;
    qty: number;
    //all | part | none 
    status: string;
}

interface OrderExtended {
    headCount?: number;
    table?: Table;
    tableParty?: TableParty;
    remind?: Remind;
    numberPlate?: number;
}

interface Remind {
    remindTime: Date | string;
    operator: { id: string, name: string };
    remindCount: number;
}

interface Payments {
    id: string;
    amount: number;
    channel: string;    // 支付方式
    channelId: string;  // 支付类型id
    charge: number; // 找零
    createTime: number;
    payMode: string;    // 交易类型：pay 消费/ refund 退款
    received: number;   // 实收
    refunded: boolean;  // 是否已退
    storeId: string;    // 商铺Id
    extended: string;   // 扩展信息，用于包括支付所需记录的详细内容，或者其他内容。JSON格式
}

interface ProcessStatus {
    id: string;
    orderNo: string;
    statusType: string;
    status: string;
    detail: Detail[];
}

interface Detail {
    id: string;
    orderNo: string;
    statusType: string;
    status: string;
    createTime: number;
}