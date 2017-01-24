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
var entityCopier_1 = require("../entityCopier");
var entityObject_1 = require("../entityObject");
var EntityObjectMysql = (function (_super) {
    __extends(EntityObjectMysql, _super);
    function EntityObjectMysql(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.sqlTemp = [];
        _this.queryParam = new Object();
        _this.ctx = ctx;
        return _this;
    }
    EntityObjectMysql.prototype.toString = function () { return ""; };
    EntityObjectMysql.prototype.Where = function (qFn, paramsKey, paramsValue) {
        this.sqlTemp.push("(" + this.formateCode(qFn, paramsKey, paramsValue) + ")");
        return this;
    };
    EntityObjectMysql.prototype.Select = function (qFn) {
        var fileds = this.formateCode(qFn);
        this.queryParam.SelectFileds = fileds.split("AND");
        return this;
    };
    EntityObjectMysql.prototype.Any = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Count(qFn, paramsKey, paramsValue, queryCallback)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                resolve(result > 0);
                            })];
                }
            });
        });
    };
    EntityObjectMysql.prototype.Count = function (qFn, paramsKey, paramsValue, queryCallback) {
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
    EntityObjectMysql.prototype.Contains = function (feild, values) {
        var filed = this.formateCode(feild);
        if (values && values.length > 0) {
            var sql = "";
            if (isNaN(values[0])) {
                for (var i = 0; i < values.length; i++) {
                    values[i] = "'" + values[i] + "'";
                }
            }
            sql = filed + " IN (" + values.join(",") + ")";
            this.sqlTemp.push("(" + sql + ")");
            return this;
        }
    };
    EntityObjectMysql.prototype.First = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, row, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (qFn) {
                            sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
                        }
                        else {
                            sql = "SELECT * FROM " + this.toString();
                        }
                        this.Skip(0);
                        this.Take(1);
                        sql = this.addQueryStence(sql) + ";";
                        return [4 /*yield*/, this.ctx.Query(sql)];
                    case 1:
                        row = _a.sent();
                        if (row && row[0]) {
                            obj = row[0];
                        }
                        if (obj)
                            return [2 /*return*/, this.clone(entityCopier_1.EntityCopier.Decode(obj), new Object())];
                        else
                            return [2 /*return*/, null];
                        return [2 /*return*/];
                }
            });
        });
    };
    EntityObjectMysql.prototype.Take = function (count) {
        this.queryParam.TakeCount = count;
        return this;
    };
    EntityObjectMysql.prototype.Skip = function (count) {
        this.queryParam.SkipCount = count;
        return this;
    };
    EntityObjectMysql.prototype.OrderBy = function (qFn) {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    };
    EntityObjectMysql.prototype.OrderByDesc = function (qFn) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    };
    EntityObjectMysql.prototype.ToList = function (queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var row, sql, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.sqlTemp.length > 0))
                            return [3 /*break*/, 2];
                        sql = "SELECT * FROM " + this.toString() + " WHERE " + this.sqlTemp.join(' && ');
                        sql = this.addQueryStence(sql) + ";";
                        return [4 /*yield*/, this.ctx.Query(sql)];
                    case 1:
                        row = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        sql = "SELECT * FROM " + this.toString();
                        sql = this.addQueryStence(sql) + ";";
                        return [4 /*yield*/, this.ctx.Query(sql)];
                    case 3:
                        row = _a.sent();
                        _a.label = 4;
                    case 4:
                        this.sqlTemp = [];
                        if (row[0])
                            return [2 /*return*/, this.cloneList(row)];
                        else
                            return [2 /*return*/, []];
                        return [2 /*return*/];
                }
            });
        });
    };
    EntityObjectMysql.prototype.Max = function (qFn) {
        return null;
    };
    EntityObjectMysql.prototype.Min = function (qFn) {
        return null;
    };
    EntityObjectMysql.prototype.formateCode = function (qFn, paramsKey, paramsValue) {
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
        qFnS = qFnS.replace(/\=\=/g, "=");
        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length)
                throw 'paramsKey,paramsValue 参数异常';
            for (var i = 0; i < paramsKey.length; i++) {
                var v = paramsValue[i];
                if (isNaN(v))
                    v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }
        return qFnS;
    };
    EntityObjectMysql.prototype.clone = function (source, destination, isDeep) {
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
    EntityObjectMysql.prototype.cloneList = function (list) {
        var _this = this;
        var r = [];
        list.forEach(function (x) {
            if (x)
                r.push(_this.clone(entityCopier_1.EntityCopier.Decode(x), new Object(), false));
        });
        return r;
    };
    EntityObjectMysql.prototype.addQueryStence = function (sql) {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDERBY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if ((this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) && (this.queryParam.SkipCount != null && this.queryParam.SkipCount != undefined)) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    };
    EntityObjectMysql.prototype.clearQueryParams = function () {
        this.queryParam = new Object();
    };
    return EntityObjectMysql;
}(entityObject_1.EntityObject));
exports.EntityObjectMysql = EntityObjectMysql;
//# sourceMappingURL=entityObjectMysql.js.map