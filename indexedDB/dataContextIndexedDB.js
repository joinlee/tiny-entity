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
var indexedDB_1 = require("./indexedDB");
var IndexedDBDataContext = (function () {
    function IndexedDBDataContext(dbName, dbVersion, tableDefines) {
        this.dbVersion = 0;
        this._qScratchpad = [];
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tableDefines = tableDefines;
        this.db = new indexedDB_1.LocalIndexedDB(this.dbName, this.dbVersion, this.tableDefines);
    }
    IndexedDBDataContext.prototype.Create = function (obj) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ExcuteQuery([{
                    QueryAction: QueryActionType.Insert,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: function (r) {
                        resolve(r);
                    }
                }]);
        });
    };
    IndexedDBDataContext.prototype.Delete = function (obj) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ExcuteQuery([{
                    QueryAction: QueryActionType.Delete,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: function (r) {
                        resolve(r);
                    }
                }]);
        });
    };
    ;
    IndexedDBDataContext.prototype.Clear = function (tbName) {
        return __awaiter(this, void 0, void 0, function () {
            var trans, store;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.GetTransaction([tbName], indexedDB_1.DBTranscationModel.Readwrite)];
                    case 1:
                        trans = _a.sent();
                        store = this.db.GetStore(tbName, trans);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var request = store.clear();
                                request.onsuccess = function (evt) {
                                    resolve(evt);
                                };
                                request.onerror = function (evt) {
                                    reject(evt);
                                };
                            })];
                }
            });
        });
    };
    IndexedDBDataContext.prototype.Update = function (obj) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.ExcuteQuery([{
                    QueryAction: QueryActionType.Update,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: function (r) {
                        resolve(r);
                    }
                }]);
        });
    };
    IndexedDBDataContext.prototype.AddQueryScratchpad = function (tbName, qActionType, queryFunction) {
        this._qScratchpad.push({
            QueryAction: qActionType,
            TableName: tbName,
            QueryFunction: queryFunction
        });
    };
    IndexedDBDataContext.prototype.OnSubmit = function (queryCallback, tableName) {
        if (this._qScratchpad.length == 0) {
            this.AddQueryScratchpad(tableName, QueryActionType.SelectAll, null);
        }
        return this.ExcuteQuery(this._qScratchpad, queryCallback);
    };
    IndexedDBDataContext.prototype.ExcuteQuery = function (qs, queryCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var trans_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(qs && qs.length > 0))
                            return [3 /*break*/, 2];
                        return [4 /*yield*/, this.GetTranscationByQuery(qs)];
                    case 1:
                        trans_1 = _a.sent();
                        qs.forEach(function (ii) {
                            var dbRequest, store = trans_1.objectStore(ii.TableName);
                            if (ii.QueryAction == QueryActionType.Insert) {
                                var o = JSON.parse(JSON.stringify(ii.EntityObject));
                                dbRequest = store.add(o);
                                dbRequest.onsuccess = function (evt) {
                                    var rId = evt.target.result;
                                    ii.ResultCallback && ii.ResultCallback(rId);
                                };
                            }
                            else if (ii.QueryAction == QueryActionType.Update) {
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        if (cursor.value.id == ii.EntityObject.id) {
                                            var p = ii.EntityObject;
                                            delete p.ctx;
                                            var o = _this.copy(cursor.value, p);
                                            cursor.update(o);
                                        }
                                        else
                                            cursor.continue();
                                    }
                                    else {
                                        queryCallback && queryCallback(true);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.Delete) {
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        if (cursor.value.id == ii.EntityObject.id) {
                                            var idbQuest = cursor.delete();
                                            idbQuest.onerror = function (evt) {
                                                console.log(evt);
                                            };
                                        }
                                        else
                                            cursor.continue();
                                    }
                                    else {
                                        queryCallback && queryCallback(true);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.Select) {
                                var resultAssemble_1 = [];
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        if (ii.QueryFunction(cursor.value)) {
                                            resultAssemble_1.push(cursor.value);
                                        }
                                        cursor.continue();
                                    }
                                    else {
                                        queryCallback && queryCallback(resultAssemble_1);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.SelectAll) {
                                var resultAssemble_2 = [];
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        resultAssemble_2.push(cursor.value);
                                        cursor.continue();
                                    }
                                    else {
                                        queryCallback && queryCallback(resultAssemble_2);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.SelectAny) {
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        if (ii.QueryFunction(cursor.value)) {
                                            queryCallback && queryCallback(true);
                                        }
                                        else
                                            cursor.continue();
                                    }
                                    else {
                                        queryCallback && queryCallback(false);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.SelectCount) {
                                var countResult_1 = 0;
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        if (ii.QueryFunction(cursor.value)) {
                                            countResult_1++;
                                            cursor.continue();
                                        }
                                    }
                                    else {
                                        queryCallback && queryCallback(countResult_1);
                                    }
                                });
                            }
                            else if (ii.QueryAction == QueryActionType.SelectFirst) {
                                _this.db.GetIndexCursor(store.index("id"), function (cursor) {
                                    if (cursor) {
                                        var r = cursor.value;
                                        if (ii.QueryFunction(r))
                                            queryCallback && queryCallback(r);
                                        else
                                            cursor.continue();
                                    }
                                    else
                                        queryCallback && queryCallback(null);
                                });
                            }
                        });
                        this._qScratchpad = [];
                        trans_1.oncomplete = function () {
                            _this._qScratchpad = [];
                        };
                        trans_1.onerror = function (evt) {
                            _this._qScratchpad = [];
                            console.error("trans.onerror", evt);
                        };
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    IndexedDBDataContext.prototype.copy = function (s, d) {
        for (var key in d) {
            if (typeof (d[key]) == "object") {
                s[key] = this.copy({}, d[key]);
            }
            else {
                s[key] = d[key];
            }
        }
        return s;
    };
    IndexedDBDataContext.prototype.GetMaxIdentity = function (tbName) {
        return __awaiter(this, void 0, void 0, function () {
            var dbMode, trans, store, request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
                        return [4 /*yield*/, this.db.GetTransaction([tbName], dbMode)];
                    case 1:
                        trans = _a.sent();
                        store = this.db.GetStore(tbName, trans);
                        request = store.count();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                request.onsuccess = function () {
                                    resolve(request.result);
                                };
                            })];
                }
            });
        });
    };
    IndexedDBDataContext.prototype.GetTranscationByQuery = function (qs) {
        var dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
        var tbNames = [];
        qs.forEach(function (ii) {
            tbNames.push(ii.TableName);
            if (ii.QueryAction == QueryActionType.Insert || ii.QueryAction == QueryActionType.Update || ii.QueryAction == QueryActionType.Delete) {
                dbMode = indexedDB_1.DBTranscationModel.Readwrite;
            }
            else if (ii.QueryAction == QueryActionType.Select) {
                dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
            }
        });
        return this.db.GetTransaction(tbNames, dbMode);
    };
    IndexedDBDataContext.prototype.Clone = function (source, destination, isDeep) {
        if (!source)
            return null;
        for (var key in source) {
            if (typeof (key) != "function") {
                if (isDeep) {
                }
                else {
                    if (typeof (key) != "object") {
                        destination[key] = source[key];
                    }
                }
            }
        }
        return destination;
    };
    IndexedDBDataContext.prototype.BeginTranscation = function () { };
    ;
    IndexedDBDataContext.prototype.Commit = function () { };
    ;
    IndexedDBDataContext.prototype.Query = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    ;
    IndexedDBDataContext.prototype.RollBack = function () { };
    ;
    return IndexedDBDataContext;
}());
exports.IndexedDBDataContext = IndexedDBDataContext;
var QueryActionType;
(function (QueryActionType) {
    QueryActionType[QueryActionType["Insert"] = 0] = "Insert";
    QueryActionType[QueryActionType["Update"] = 1] = "Update";
    QueryActionType[QueryActionType["Delete"] = 2] = "Delete";
    QueryActionType[QueryActionType["Select"] = 3] = "Select";
    QueryActionType[QueryActionType["SelectAny"] = 4] = "SelectAny";
    QueryActionType[QueryActionType["SelectCount"] = 5] = "SelectCount";
    QueryActionType[QueryActionType["SelectFirst"] = 6] = "SelectFirst";
    QueryActionType[QueryActionType["SelectAll"] = 7] = "SelectAll";
})(QueryActionType = exports.QueryActionType || (exports.QueryActionType = {}));
//# sourceMappingURL=dataContextIndexedDB.js.map