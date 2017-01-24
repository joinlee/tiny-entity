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
var dataContextNeDB_1 = require("./dataContextNeDB");
var entityObject_1 = require("../entityObject");
var EntityObjectNeDB = (function (_super) {
    __extends(EntityObjectNeDB, _super);
    function EntityObjectNeDB(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.sqlTemp = [];
        _this.queryParam = new Object();
        _this.ctx = ctx;
        return _this;
    }
    EntityObjectNeDB.prototype.toString = function () { return ""; };
    EntityObjectNeDB.prototype.Where = function (qFn, paramsKey, paramsValue) {
        this.sqlTemp.push(qFn);
        return this;
    };
    EntityObjectNeDB.prototype.Select = function (qFn) {
        return null;
    };
    EntityObjectNeDB.prototype.Any = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.First(qFn)];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, r ? true : false];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.Count = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var p, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = [];
                        if (qFn)
                            p.push(qFn);
                        else
                            p = null;
                        return [4 /*yield*/, this.ctx.Query(p, this.toString(), dataContextNeDB_1.QueryMode.Count)];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, r];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.First = function (qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ctx.Query([qFn], this.toString(), dataContextNeDB_1.QueryMode.First)];
                    case 1:
                        r = _a.sent();
                        return [2 /*return*/, this.clone(r, new Object())];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.Take = function (count) {
        return null;
    };
    EntityObjectNeDB.prototype.Skip = function (count) {
        return null;
    };
    EntityObjectNeDB.prototype.OrderBy = function (qFn) {
        this.queryParam.OrderByFiledName = this.getFeild(qFn);
        return this;
    };
    EntityObjectNeDB.prototype.OrderByDesc = function (qFn) {
        this.queryParam.IsDesc = true;
        this.OrderBy(qFn);
        return this;
    };
    EntityObjectNeDB.prototype.Sum = function (qFn) {
        return __awaiter(this, void 0, void 0, function () {
            var feild, r, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        feild = this.getFeild(qFn);
                        return [4 /*yield*/, this.ToList()];
                    case 1:
                        r = _a.sent();
                        result = 0;
                        r.forEach(function (x) { return result += x[feild]; });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.ToList = function (queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var r, result, orderByFiled_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.sqlTemp.length > 0))
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.ctx.Query(this.sqlTemp, this.toString())];
                    case 1:
                        r = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.ctx.Query([function (x) { return true; }], this.toString())];
                    case 3:
                        r = _a.sent();
                        _a.label = 4;
                    case 4:
                        result = this.cloneList(r);
                        if (this.queryParam) {
                            if (this.queryParam.OrderByFiledName) {
                                orderByFiled_1 = this.queryParam.OrderByFiledName;
                                if (this.queryParam.IsDesc) {
                                    result = result.sort(function (a, b) {
                                        return b[orderByFiled_1] - a[orderByFiled_1];
                                    });
                                }
                                else {
                                    result = result.sort(function (a, b) {
                                        return a[orderByFiled_1] - b[orderByFiled_1];
                                    });
                                }
                            }
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.Max = function (qFn) {
        return __awaiter(this, void 0, void 0, function () {
            var feild, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        feild = this.getFeild(qFn);
                        return [4 /*yield*/, this.OrderByDesc(qFn).ToList()];
                    case 1:
                        r = _a.sent();
                        if (r && r.length > 0)
                            return [2 /*return*/, r[0]];
                        else
                            return [2 /*return*/, null];
                        return [2 /*return*/];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.Min = function (qFn) {
        return __awaiter(this, void 0, void 0, function () {
            var feild, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        feild = this.getFeild(qFn);
                        return [4 /*yield*/, this.OrderBy(qFn).ToList()];
                    case 1:
                        r = _a.sent();
                        if (r && r.length > 0)
                            return [2 /*return*/, r[0]];
                        else
                            return [2 /*return*/, null];
                        return [2 /*return*/];
                }
            });
        });
    };
    EntityObjectNeDB.prototype.Contains = function (feild, values) {
        var inq = {
            feildName: this.getFeild(feild),
            value: values
        };
        return this.ctx.Query(null, this.toString(), dataContextNeDB_1.QueryMode.Contains, null, inq);
    };
    EntityObjectNeDB.prototype.clone = function (source, destination, isDeep) {
        if (!source)
            return null;
        destination = source;
        delete destination.sqlTemp;
        delete destination.queryParam;
        delete destination._id;
        delete destination.ctx;
        destination.toString = this.toString;
        return destination;
    };
    EntityObjectNeDB.prototype.cloneList = function (list) {
        var _this = this;
        var r = [];
        list.forEach(function (x) {
            if (x)
                r.push(_this.clone(x, new Object(), false));
        });
        return r;
    };
    EntityObjectNeDB.prototype.formateCode = function (qFn, paramsKey, paramsValue) {
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
    EntityObjectNeDB.prototype.getFeild = function (qFn) {
        var qFns = this.formateCode(qFn);
        qFns = qFns.replace(/=>/g, "");
        var qList = qFns.split(".");
        if (qList.length > 2)
            throw "解析出错： getFeild(qFn): string";
        return qList[1];
    };
    return EntityObjectNeDB;
}(entityObject_1.EntityObject));
exports.EntityObjectNeDB = EntityObjectNeDB;
//# sourceMappingURL=entityObjectNeDB.js.map