"use strict";
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
var mysql = require("mysql");
var entityCopier_1 = require("../entityCopier");
var mysqlPool;
var MysqlDataContext = (function () {
    function MysqlDataContext(option) {
        this.transactionOn = false;
        this.querySentence = [];
        if (!mysqlPool)
            mysqlPool = mysql.createPool(option);
    }
    MysqlDataContext.prototype.Create = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var sqlStr, pt, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqlStr = "INSERT INTO " + obj.toString();
                        pt = this.propertyFormat(obj);
                        sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";
                        console.log(sqlStr);
                        if (!this.transactionOn)
                            return [3 /*break*/, 1];
                        this.querySentence.push(sqlStr);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.onSubmit(sqlStr)];
                    case 2:
                        r = _a.sent();
                        return [2 /*return*/, entityCopier_1.EntityCopier.Decode(obj)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MysqlDataContext.prototype.Update = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var sqlStr, qList, key, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sqlStr = "UPDATE " + obj.toString() + " SET ";
                        qList = [];
                        for (key in obj) {
                            if (this.isNotObjectOrFunction(obj[key]) && key != "id") {
                                if (obj[key] == undefined || obj[key] == null || obj[key] == "")
                                    continue;
                                if (isNaN(obj[key])) {
                                    qList.push(key + "='" + obj[key] + "'");
                                }
                                else if (obj[key] instanceof Date) {
                                    qList.push(key + "='" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                                }
                                else {
                                    qList.push(key + "=" + obj[key]);
                                }
                            }
                        }
                        sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
                        console.log("Update:", sqlStr);
                        if (!this.transactionOn)
                            return [3 /*break*/, 1];
                        this.querySentence.push(sqlStr);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.onSubmit(sqlStr)];
                    case 2:
                        r = _a.sent();
                        return [2 /*return*/, entityCopier_1.EntityCopier.Decode(obj)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MysqlDataContext.prototype.Delete = function (obj) {
        var sqlStr = "DELETE FROM " + obj.toString() + " WHERE id='" + obj.id + "';";
        console.log("DELETE:", sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    };
    MysqlDataContext.prototype.BeginTranscation = function () {
        this.transactionOn = true;
    };
    MysqlDataContext.prototype.Commit = function () {
        var _this = this;
        if (!this.transactionOn)
            return;
        return new Promise(function (resolve, reject) {
            mysqlPool.getConnection(function (err, conn) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var _i, _a, sql, r;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (err) {
                                conn.release();
                                reject(err);
                            }
                            conn.beginTransaction(function (err) {
                                if (err) {
                                    conn.release();
                                    reject(err);
                                }
                            });
                            _i = 0, _a = this.querySentence;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length))
                                return [3 /*break*/, 4];
                            sql = _a[_i];
                            return [4 /*yield*/, this.TrasnQuery(conn, sql)];
                        case 2:
                            r = _b.sent();
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            conn.commit(function (err) {
                                if (err)
                                    conn.rollback(function () {
                                        conn.release();
                                        reject(err);
                                    });
                                _this.querySentence = [];
                                _this.transactionOn = false;
                                conn.release();
                                resolve(true);
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    MysqlDataContext.prototype.TrasnQuery = function (conn, sql) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        conn.query(sql, function (err, result) {
                            if (err) {
                                conn.rollback(function () { reject(err); });
                            }
                            else {
                                resolve(result);
                            }
                        });
                    })];
            });
        });
    };
    MysqlDataContext.prototype.RollBack = function () { };
    MysqlDataContext.prototype.Query = function (sqlStr) {
        console.log(sqlStr);
        return this.onSubmit(sqlStr);
    };
    MysqlDataContext.prototype.onSubmit = function (sqlStr) {
        return new Promise(function (resolve, reject) {
            mysqlPool.getConnection(function (err, conn) {
                console.log("mysql onSubmits error:", err);
                if (err) {
                    conn.release();
                    reject(err);
                }
                conn.query(sqlStr, function (err, args) {
                    conn.release();
                    if (err)
                        reject(err);
                    else
                        resolve(args);
                });
            });
        });
    };
    MysqlDataContext.prototype.propertyFormat = function (obj) {
        var propertyNameList = [];
        var propertyValueList = [];
        for (var key in obj) {
            if (this.isNotObjectOrFunction(obj[key])) {
                if (obj[key] == undefined || obj[key] == null)
                    continue;
                propertyNameList.push(key);
                if (isNaN(obj[key])) {
                    propertyValueList.push("'" + obj[key] + "'");
                }
                else if (obj[key] instanceof Date) {
                    propertyValueList.push("'" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                }
                else {
                    propertyValueList.push(obj[key]);
                }
            }
        }
        return { PropertyNameList: propertyNameList, PropertyValueList: propertyValueList };
    };
    MysqlDataContext.prototype.isNotObjectOrFunction = function (value) {
        if (value instanceof Date)
            return true;
        return typeof (value) != "object" && typeof (value) != "function" && value != "undefine" && value != null;
    };
    MysqlDataContext.prototype.dateFormat = function (d, fmt) {
        var o = {
            "M+": d.getMonth() + 1,
            "d+": d.getDate(),
            "H+": d.getHours(),
            "m+": d.getMinutes(),
            "s+": d.getSeconds(),
            "q+": Math.floor((d.getMonth() + 3) / 3),
            "S": d.getMilliseconds()
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    return MysqlDataContext;
}());
exports.MysqlDataContext = MysqlDataContext;
//# sourceMappingURL=dataContextMysql.js.map