"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const indexedDB_1 = require("./indexedDB");
class IndexedDBDataContext {
    constructor(dbName, dbVersion, tableDefines) {
        this.dbVersion = 0;
        this._qScratchpad = [];
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tableDefines = tableDefines;
        this.db = new indexedDB_1.LocalIndexedDB(this.dbName, this.dbVersion, this.tableDefines);
    }
    Create(obj) {
        return new Promise((resolve, reject) => {
            this.ExcuteQuery([{
                    QueryAction: QueryActionType.Insert,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: (r) => {
                        resolve(r);
                    }
                }]);
        });
    }
    Delete(obj) {
        return new Promise((resolve, reject) => {
            this.ExcuteQuery([{
                    QueryAction: QueryActionType.Delete,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: (r) => {
                        resolve(r);
                    }
                }]);
        });
    }
    ;
    Clear(tbName) {
        return __awaiter(this, void 0, void 0, function* () {
            let trans = yield this.db.GetTransaction([tbName], indexedDB_1.DBTranscationModel.Readwrite);
            let store = this.db.GetStore(tbName, trans);
            return new Promise((resolve, reject) => {
                let request = store.clear();
                request.onsuccess = (evt) => {
                    resolve(evt);
                };
                request.onerror = (evt) => {
                    reject(evt);
                };
            });
        });
    }
    Update(obj) {
        return new Promise((resolve, reject) => {
            this.ExcuteQuery([{
                    QueryAction: QueryActionType.Update,
                    TableName: obj.toString(),
                    EntityObject: obj,
                    ResultCallback: (r) => {
                        resolve(r);
                    }
                }]);
        });
    }
    AddQueryScratchpad(tbName, qActionType, queryFunction) {
        this._qScratchpad.push({
            QueryAction: qActionType,
            TableName: tbName,
            QueryFunction: queryFunction
        });
    }
    OnSubmit(queryCallback, tableName) {
        if (this._qScratchpad.length == 0) {
            this.AddQueryScratchpad(tableName, QueryActionType.SelectAll, null);
        }
        return this.ExcuteQuery(this._qScratchpad, queryCallback);
    }
    extend(target, source) {
        for (const key in source) {
            target[key] = source[key];
        }
    }
    ExcuteQuery(qs, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (qs && qs.length > 0) {
                let trans = yield this.GetTranscationByQuery(qs);
                qs.forEach(ii => {
                    let dbRequest, store = trans.objectStore(ii.TableName);
                    if (ii.QueryAction == QueryActionType.Insert) {
                        let o = JSON.parse(JSON.stringify(ii.EntityObject));
                        dbRequest = store.add(o);
                        dbRequest.onsuccess = (evt) => {
                            let rId = evt.target.result;
                            ii.ResultCallback && ii.ResultCallback(ii.EntityObject);
                        };
                    }
                    else if (ii.QueryAction == QueryActionType.Update) {
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                if (cursor.value.id == ii.EntityObject.id) {
                                    let p = ii.EntityObject;
                                    delete p.ctx;
                                    delete p.toString;
                                    this.extend(cursor.value, p);
                                    var request = cursor.update(cursor.value);
                                    ii.ResultCallback && ii.ResultCallback(ii.EntityObject);
                                }
                                else
                                    cursor.continue();
                            }
                            else {
                                ii.ResultCallback && ii.ResultCallback(ii.EntityObject);
                            }
                        });
                    }
                    else if (ii.QueryAction == QueryActionType.Delete) {
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                if (cursor.value.id == ii.EntityObject.id) {
                                    let idbQuest = cursor.delete();
                                    idbQuest.onerror = (evt) => {
                                        console.log(evt);
                                    };
                                }
                                cursor.continue();
                            }
                            else {
                                ii.ResultCallback && ii.ResultCallback(true);
                            }
                        });
                    }
                    else if (ii.QueryAction == QueryActionType.Select) {
                        let resultAssemble = [];
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                if (ii.QueryFunction(cursor.value)) {
                                    resultAssemble.push(cursor.value);
                                }
                                cursor.continue();
                            }
                            else {
                                queryCallback && queryCallback(resultAssemble);
                            }
                        });
                    }
                    else if (ii.QueryAction == QueryActionType.SelectAll) {
                        let resultAssemble = [];
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                resultAssemble.push(cursor.value);
                                cursor.continue();
                            }
                            else {
                                queryCallback && queryCallback(resultAssemble);
                            }
                        });
                    }
                    else if (ii.QueryAction == QueryActionType.SelectAny) {
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
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
                        let countResult = 0;
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                if (ii.QueryFunction(cursor.value)) {
                                    countResult++;
                                    cursor.continue();
                                }
                            }
                            else {
                                queryCallback && queryCallback(countResult);
                            }
                        });
                    }
                    else if (ii.QueryAction == QueryActionType.SelectFirst) {
                        this.db.GetIndexCursor(store.index("id"), (cursor) => {
                            if (cursor) {
                                let r = cursor.value;
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
                trans.oncomplete = () => {
                    this._qScratchpad = [];
                };
                trans.onerror = (evt) => {
                    this._qScratchpad = [];
                    console.error("trans.onerror", evt);
                };
            }
        });
    }
    copy(s, d) {
        for (let key in d) {
            if (typeof (d[key]) == "object") {
                s[key] = this.copy({}, d[key]);
            }
            else {
                s[key] = d[key];
            }
        }
        return s;
    }
    GetMaxIdentity(tbName) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
            let trans = yield this.db.GetTransaction([tbName], dbMode);
            let store = this.db.GetStore(tbName, trans);
            let request = store.count();
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result);
                };
            });
        });
    }
    GetTranscationByQuery(qs) {
        let dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
        let tbNames = [];
        qs.forEach(ii => {
            tbNames.push(ii.TableName);
            if (ii.QueryAction == QueryActionType.Insert || ii.QueryAction == QueryActionType.Update || ii.QueryAction == QueryActionType.Delete) {
                dbMode = indexedDB_1.DBTranscationModel.Readwrite;
            }
            else if (ii.QueryAction == QueryActionType.Select) {
                dbMode = indexedDB_1.DBTranscationModel.ReadOnly;
            }
        });
        return this.db.GetTransaction(tbNames, dbMode);
    }
    Clone(source, destination, isDeep) {
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
    }
    BeginTranscation() { }
    ;
    Commit() { }
    ;
    Query(...args) { }
    ;
    RollBack() { }
    ;
}
exports.IndexedDBDataContext = IndexedDBDataContext;
(function (QueryActionType) {
    QueryActionType[QueryActionType["Insert"] = 0] = "Insert";
    QueryActionType[QueryActionType["Update"] = 1] = "Update";
    QueryActionType[QueryActionType["Delete"] = 2] = "Delete";
    QueryActionType[QueryActionType["Select"] = 3] = "Select";
    QueryActionType[QueryActionType["SelectAny"] = 4] = "SelectAny";
    QueryActionType[QueryActionType["SelectCount"] = 5] = "SelectCount";
    QueryActionType[QueryActionType["SelectFirst"] = 6] = "SelectFirst";
    QueryActionType[QueryActionType["SelectAll"] = 7] = "SelectAll";
})(exports.QueryActionType || (exports.QueryActionType = {}));
var QueryActionType = exports.QueryActionType;
//# sourceMappingURL=dataContextIndexedDB.js.map