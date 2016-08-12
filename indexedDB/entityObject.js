"use strict";
///<reference path="typings/tinyDB.d.ts" />
///<reference path="./dataContext.ts" />
const dataContext_1 = require('./dataContext');
class EntityObject {
    constructor(ctx) {
        if (ctx) {
            this.ctx = ctx;
        }
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        this.ctx.AddQueryScratchpad(this.toString(), dataContext_1.QueryActionType.Select, qFn);
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), dataContext_1.QueryActionType.SelectAny, qFn);
            this.ctx.OnSubmit(r => {
                resolve(r);
            });
        });
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
    }
    OrderBy(qFn) { return this; }
    OrderByDesc(qFn) { return this; }
    Select(qFn) { return this; }
    Take(count) { return this; }
    Skip(count) { return this; }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), dataContext_1.QueryActionType.SelectFirst, qFn);
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
    clone(source, destination, isDeep = false) {
        if (!source)
            return null;
        // for (var key in source) {
        //     if (typeof (key) != "function") {
        //         if (isDeep) { 
        //         }
        //         else {
        //             if (typeof (key) != "object") {
        //                 destination[key] = source[key];
        //             }
        //         }
        //     }
        // }
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
}
exports.EntityObject = EntityObject;
