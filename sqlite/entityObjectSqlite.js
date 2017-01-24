"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var entityObject_1 = require("../entityObject");
var EntityObjectSqlite = (function (_super) {
    __extends(EntityObjectSqlite, _super);
    function EntityObjectSqlite(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.sqlTemp = [];
        _this.queryParam = new Object();
        _this.ctx = ctx;
        return _this;
    }
    EntityObjectSqlite.prototype.toString = function () { return ""; };
    EntityObjectSqlite.prototype.Where = function (qFn, paramsKey, paramsValue) {
        var sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        console.log(sql);
        this.sqlTemp.push(sql);
        return this;
    };
    EntityObjectSqlite.prototype.Select = function (qFn) {
        var filed = this.formateCode(qFn);
        this.queryParam.SelectFileds = filed.split("AND");
        return this;
    };
    EntityObjectSqlite.prototype.Any = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Count(qFn, paramsKey, paramsValue, queryCallback)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result > 0];
                }
            });
        });
    };
    EntityObjectSqlite.prototype.Count = function (qFn, paramsKey, paramsValue, queryCallback) {
        var sql = "";
        if (qFn) {
            sql = "SELECT COUNT(id) FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT COUNT(id) FROM " + this.toString();
        }
        sql = this.addQueryStence(sql) + ";";
        var r = this.ctx.Query(sql);
        var result = r ? r[0]["COUNT(id)"] : 0;
        return new Promise(function (resolve, reject) {
            resolve(result);
        });
    };
    EntityObjectSqlite.prototype.First = function (qFn, paramsKey, paramsValue, queryCallback) {
        var _this = this;
        var sql;
        if (qFn) {
            sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT * FROM " + this.toString();
        }
        this.Skip(0);
        this.Take(1);
        sql = this.addQueryStence(sql) + ";";
        var row = this.ctx.Query(sql);
        return new Promise(function (resolve, reject) {
            resolve(_this.clone(row && row['0'], new Object()));
        });
    };
    EntityObjectSqlite.prototype.Take = function (count) {
        this.queryParam.TakeCount = count;
        return this;
    };
    EntityObjectSqlite.prototype.Skip = function (count) {
        this.queryParam.SkipCount = count;
        return this;
    };
    EntityObjectSqlite.prototype.OrderBy = function (qFn) {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    };
    EntityObjectSqlite.prototype.OrderByDesc = function (qFn) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    };
    EntityObjectSqlite.prototype.ToList = function (queryCallback) {
        var _this = this;
        var row;
        if (this.sqlTemp.length > 0) {
            var sql = this.sqlTemp[0];
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        else {
            var sql = "SELECT * FROM " + this.toString();
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        return new Promise(function (resolve, reject) {
            resolve(_this.cloneList(row));
        });
    };
    EntityObjectSqlite.prototype.Max = function (qFn) {
        return null;
    };
    EntityObjectSqlite.prototype.Min = function (qFn) {
        return null;
    };
    EntityObjectSqlite.prototype.formateCode = function (qFn, paramsKey, paramsValue) {
        var qFnS = qFn.toString();
        qFnS = qFnS.replace(/function/g, "");
        qFnS = qFnS.replace(/return/g, "");
        qFnS = qFnS.replace(/if/g, "");
        qFnS = qFnS.replace(/else/g, "");
        qFnS = qFnS.replace(/true/g, "");
        qFnS = qFnS.replace(/false/g, "");
        qFnS = qFnS.replace(/\{/g, "");
        qFnS = qFnS.replace(/\}/g, "");
        qFnS = qFnS.replace(/\(/g, "");
        qFnS = qFnS.replace(/\)/g, "");
        qFnS = qFnS.replace(/\;/g, "");
        qFnS = qFnS.replace(/=>/g, "");
        qFnS = qFnS.trim();
        var p = qFnS[0];
        qFnS = qFnS.substring(1, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p, "gm"), this.toString());
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length)
                throw 'paramsKey,paramsValue 参数异常';
            for (var i = 0; i < paramsKey.length; i++) {
                var v = paramsValue[i];
                if (isNaN)
                    v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }
        return qFnS;
    };
    EntityObjectSqlite.prototype.clone = function (source, destination, isDeep) {
        if (!source)
            return null;
        for (var key in source) {
            if (typeof (key) != "function") {
                if (isDeep) { }
                else {
                    if (typeof (key) != "object") {
                        destination[key] = source[key];
                    }
                }
            }
        }
        return destination;
    };
    EntityObjectSqlite.prototype.cloneList = function (list) {
        var _this = this;
        var r = [];
        list.forEach(function (x) {
            if (x)
                r.push(_this.clone(x, new Object(), false));
        });
        return r;
    };
    EntityObjectSqlite.prototype.addQueryStence = function (sql) {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDERBY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if (this.queryParam.TakeCount && this.queryParam.SkipCount) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    };
    EntityObjectSqlite.prototype.clearQueryParams = function () {
        this.queryParam = new Object();
    };
    return EntityObjectSqlite;
}(entityObject_1.EntityObject));
exports.EntityObjectSqlite = EntityObjectSqlite;
//# sourceMappingURL=entityObjectSqlite.js.map