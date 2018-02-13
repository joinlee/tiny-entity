"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataContextIndexedDB_1 = require("./dataContextIndexedDB");
const entityObject_1 = require("../entityObject");
class EntityObjectIndexedDB extends entityObject_1.EntityObject {
    constructor(ctx) {
        super(ctx);
        if (ctx) {
            this.ctx = ctx;
        }
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue, entity) {
        this.ctx.AddQueryScratchpad(this.toString(), dataContextIndexedDB_1.QueryActionType.Select, qFn);
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), dataContextIndexedDB_1.QueryActionType.SelectAny, qFn);
            this.ctx.OnSubmit(r => {
                resolve(r);
            });
        });
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), dataContextIndexedDB_1.QueryActionType.SelectCount, qFn);
            this.ctx.OnSubmit(r => {
                resolve(r);
            });
        });
    }
    OrderBy(qFn, entity) { return null; }
    OrderByDesc(qFn, entity) { return null; }
    Select(qFn) { return null; }
    Take(count) {
        this.ctx.AddTakeCount(count);
        return this;
    }
    Skip(count) {
        this.ctx.AddSkipCount(count);
        return this;
    }
    Max(qFn) { return null; }
    Min(qFn) { return null; }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), dataContextIndexedDB_1.QueryActionType.SelectFirst, qFn);
            this.ctx.OnSubmit(x => {
                resolve(this.clone(x, this));
            });
        });
    }
    ToList(queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.OnSubmit(r => {
                resolve(this.cloneList(r));
            }, this.toString());
        });
    }
    clone(source, destination, isDeep) {
        if (!source)
            return null;
        destination = JSON.parse(JSON.stringify(source));
        delete destination.sqlTemp;
        delete destination.queryParam;
        delete destination._id;
        delete destination.ctx;
        destination.toString = this.toString;
        return destination;
    }
    cloneList(list) {
        let r = [];
        list.forEach(x => {
            if (x)
                r.push(this.clone(x, new Object(), false));
        });
        return r;
    }
    Join(qFn, entity, mainFeild, isMainTable) {
        return this;
    }
    Contains(feild, values) {
        return this;
    }
}
exports.EntityObjectIndexedDB = EntityObjectIndexedDB;
//# sourceMappingURL=entityObjectIndexedDB.js.map