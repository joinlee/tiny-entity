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
var Datastore = require("nedb");
var dbconfig;
var nedbPool_1 = require("./nedbPool");
var NeDBDataContext = (function () {
    function NeDBDataContext(config) {
        this.transList = [];
        this.dbLinks = [];
        this.config = config;
        dbconfig = config;
        if (!config.IsMulitTabel) {
            this.nedb = new Datastore(config.FilePath + config.DBName);
            this.nedb.loadDatabase();
        }
    }
    NeDBDataContext.prototype.Create = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promise;
            return __generator(this, function (_a) {
                if (stillOpen == undefined || stillOpen == null)
                    stillOpen = true;
                delete obj.ctx;
                promise = new Promise(function (resolve, reject) {
                    _this.createInner(obj, stillOpen).then(function (r) {
                        _this.pushQuery("create", obj);
                        resolve(r);
                    })
                        .catch(function (err) {
                        if (err.errorType == "uniqueViolated") {
                            reject({ code: -101, message: "插入失败：重复的主键id" });
                        }
                        else
                            reject(err);
                    });
                });
                return [2 /*return*/, promise];
            });
        });
    };
    NeDBDataContext.prototype.createInner = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nedbPool_1.NeDBPool.Current.GetDBConnection(obj.toString(), this.config)];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.insert(obj, function (err, r) {
                                    if (err)
                                        reject(err);
                                    else {
                                        resolve(r);
                                    }
                                });
                            })];
                }
            });
        });
    };
    NeDBDataContext.prototype.UpdateRange = function (list, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entityList;
            return __generator(this, function (_a) {
                if (stillOpen == undefined || stillOpen == null)
                    stillOpen = true;
                entityList = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        try {
                            for (var index = 0, l = list.length; index < l; index++) {
                                var element = list[index];
                                _this.Update(element).then(function (v) {
                                    entityList.push(v);
                                    if (entityList.length == l) {
                                        resolve(entityList);
                                    }
                                }).catch(function (err) { new Error(err); });
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    })];
            });
        });
    };
    NeDBDataContext.prototype.Update = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (stillOpen == undefined || stillOpen == null)
                            stillOpen = true;
                        delete obj.ctx;
                        if (!this.transOn)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getEntity(obj.toString(), obj.id, stillOpen)];
                    case 1:
                        entity = _a.sent();
                        entity.toString = obj.toString;
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            _this.UpdateInner(obj, stillOpen).then(function (r) {
                                _this.pushQuery("update", entity);
                                resolve(r);
                            }).catch(function (err) {
                                reject(err);
                            });
                        })];
                }
            });
        });
    };
    NeDBDataContext.prototype.UpdateInner = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delete obj._id;
                        return [4 /*yield*/, nedbPool_1.NeDBPool.Current.GetDBConnection(obj.toString(), this.config)];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.update({ id: obj.id }, obj, { upsert: true }, function (err, numReplaced, upsert) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(obj);
                                    }
                                });
                            })];
                }
            });
        });
    };
    NeDBDataContext.prototype.getEntity = function (name, id, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nedbPool_1.NeDBPool.Current.GetDBConnection(name, this.config)];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.findOne({ id: id }, function (err, r) {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve(r);
                                });
                            })];
                }
            });
        });
    };
    NeDBDataContext.prototype.Delete = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entity, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (stillOpen == undefined || stillOpen == null)
                            stillOpen = true;
                        if (!this.transOn)
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getEntity(obj.toString(), obj.id, stillOpen)];
                    case 1:
                        entity = _a.sent();
                        entity.toString = obj.toString;
                        _a.label = 2;
                    case 2:
                        promise = new Promise(function (resolve, reject) {
                            _this.deleteInner(obj, stillOpen).then(function () {
                                _this.pushQuery("delete", entity);
                                resolve(true);
                            }).catch(function (err) {
                                reject(err);
                            });
                        });
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    NeDBDataContext.prototype.deleteInner = function (obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function () {
            var db, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nedbPool_1.NeDBPool.Current.GetDBConnection(obj.toString(), this.config)];
                    case 1:
                        db = _a.sent();
                        promise = new Promise(function (resolve, reject) {
                            db.remove({ id: obj.id }, {}, function (err, numRemoved) {
                                if (err)
                                    reject(err);
                                else {
                                    resolve(true);
                                }
                            });
                        });
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    NeDBDataContext.prototype.BeginTranscation = function () {
        this.transOn = true;
    };
    NeDBDataContext.prototype.Commit = function () {
        console.log("Commit this.transOn:", this.transOn);
        if (this.transOn) {
            this.transList = [];
            this.transOn = false;
        }
        ;
    };
    NeDBDataContext.prototype.Query = function (qFn, tableName, queryMode, orderByFn, inqObj) {
        return __awaiter(this, void 0, void 0, function () {
            var db, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (queryMode == undefined || queryMode == null)
                            queryMode = QueryMode.Normal;
                        return [4 /*yield*/, nedbPool_1.NeDBPool.Current.GetDBConnection(tableName, this.config)];
                    case 1:
                        db = _a.sent();
                        promise = new Promise(function (resolve, reject) {
                            var queryFn = {};
                            if (qFn) {
                                queryFn = {
                                    $where: function () {
                                        try {
                                            var r = true;
                                            for (var i = 0; i < qFn.length; i++) {
                                                if (qFn[i] == null || qFn[i] == undefined)
                                                    break;
                                                if (!qFn[i](this)) {
                                                    r = false;
                                                    break;
                                                }
                                            }
                                            return r;
                                        }
                                        catch (error) {
                                            return false;
                                        }
                                    }
                                };
                            }
                            switch (queryMode) {
                                case QueryMode.Normal:
                                    db.find(queryFn, function (err, r) {
                                        if (err)
                                            reject(err);
                                        else
                                            resolve(r);
                                    });
                                    break;
                                case QueryMode.Count:
                                    db.count(queryFn, function (err, r) {
                                        if (err)
                                            reject(err);
                                        else
                                            resolve(r);
                                    });
                                    break;
                                case QueryMode.First:
                                    db.findOne(queryFn, function (err, r) {
                                        if (err)
                                            reject(err);
                                        else
                                            resolve(r);
                                    });
                                    break;
                                case QueryMode.Contains:
                                    var inq = {};
                                    inq[inqObj.feildName] = {
                                        $in: inqObj.value
                                    };
                                    db.find(inq, function (err, r) {
                                        if (err)
                                            reject(err);
                                        else
                                            resolve(r);
                                    });
                                    break;
                            }
                        });
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    NeDBDataContext.prototype.RollBack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var index, item, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.transOn)
                            return [3 /*break*/, 13];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 11, 12, 13]);
                        index = this.transList.length - 1;
                        _b.label = 2;
                    case 2:
                        if (!(index >= 0))
                            return [3 /*break*/, 10];
                        item = this.transList[index];
                        console.log(item);
                        _a = item.key;
                        switch (_a) {
                            case "create": return [3 /*break*/, 3];
                            case "update": return [3 /*break*/, 5];
                            case "delete": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.deleteInner(item.entity)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, this.UpdateInner(item.entity)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.createInner(item.entity)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        index--;
                        return [3 /*break*/, 2];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        error_1 = _b.sent();
                        console.log("回滚失败");
                        return [3 /*break*/, 13];
                    case 12:
                        this.transList = [];
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    NeDBDataContext.prototype.pushQuery = function (key, obj) {
        if (this.transOn) {
            this.transList.push({
                key: key,
                entity: obj
            });
        }
    };
    return NeDBDataContext;
}());
exports.NeDBDataContext = NeDBDataContext;
var timer;
var QueryMode;
(function (QueryMode) {
    QueryMode[QueryMode["Normal"] = 0] = "Normal";
    QueryMode[QueryMode["First"] = 1] = "First";
    QueryMode[QueryMode["Count"] = 2] = "Count";
    QueryMode[QueryMode["Contains"] = 3] = "Contains";
})(QueryMode = exports.QueryMode || (exports.QueryMode = {}));
//# sourceMappingURL=dataContextNeDB.js.map