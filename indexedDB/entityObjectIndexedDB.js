"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dataContextIndexedDB_1 = require("./dataContextIndexedDB");
var entityObject_1 = require("../entityObject");
var EntityObjectIndexedDB = (function (_super) {
    __extends(EntityObjectIndexedDB, _super);
    function EntityObjectIndexedDB(ctx) {
        var _this = _super.call(this, ctx) || this;
        if (ctx) {
            _this.ctx = ctx;
        }
        return _this;
    }
    EntityObjectIndexedDB.prototype.toString = function () { return ""; };
    EntityObjectIndexedDB.prototype.Where = function (qFn, paramsKey, paramsValue) {
        this.ctx.AddQueryScratchpad(this.toString(), dataContextIndexedDB_1.QueryActionType.Select, qFn);
        return this;
    };
    EntityObjectIndexedDB.prototype.Any = function (qFn, paramsKey, paramsValue, queryCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ctx.AddQueryScratchpad(_this.toString(), dataContextIndexedDB_1.QueryActionType.SelectAny, qFn);
            _this.ctx.OnSubmit(function (r) {
                resolve(r);
            });
        });
    };
    EntityObjectIndexedDB.prototype.Count = function (qFn, paramsKey, paramsValue, queryCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ctx.AddQueryScratchpad(_this.toString(), dataContextIndexedDB_1.QueryActionType.SelectCount, qFn);
            _this.ctx.OnSubmit(function (r) {
                resolve(r);
            });
        });
    };
    EntityObjectIndexedDB.prototype.OrderBy = function (qFn) { return this; };
    EntityObjectIndexedDB.prototype.OrderByDesc = function (qFn) { return this; };
    EntityObjectIndexedDB.prototype.Select = function (qFn) { return this; };
    EntityObjectIndexedDB.prototype.Take = function (count) { return this; };
    EntityObjectIndexedDB.prototype.Skip = function (count) { return this; };
    EntityObjectIndexedDB.prototype.Max = function (qFn) { return null; };
    EntityObjectIndexedDB.prototype.Min = function (qFn) { return null; };
    EntityObjectIndexedDB.prototype.First = function (qFn, paramsKey, paramsValue, queryCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ctx.AddQueryScratchpad(_this.toString(), dataContextIndexedDB_1.QueryActionType.SelectFirst, qFn);
            _this.ctx.OnSubmit(function (x) {
                resolve(_this.clone(x, _this));
            });
        });
    };
    EntityObjectIndexedDB.prototype.ToList = function (queryCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ctx.OnSubmit(function (r) {
                resolve(_this.cloneList(r));
            }, _this.toString());
        });
    };
    EntityObjectIndexedDB.prototype.clone = function (source, destination, isDeep) {
        if (!source)
            return null;
        destination = JSON.parse(JSON.stringify(source));
        delete destination.sqlTemp;
        delete destination.queryParam;
        delete destination._id;
        delete destination.ctx;
        destination.toString = this.toString;
        return destination;
    };
    EntityObjectIndexedDB.prototype.cloneList = function (list) {
        var _this = this;
        var r = [];
        list.forEach(function (x) {
            if (x)
                r.push(_this.clone(x, new Object(), false));
        });
        return r;
    };
    return EntityObjectIndexedDB;
}(entityObject_1.EntityObject));
exports.EntityObjectIndexedDB = EntityObjectIndexedDB;
//# sourceMappingURL=entityObjectIndexedDB.js.map