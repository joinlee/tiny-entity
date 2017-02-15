"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class LocalIndexedDB {
    constructor(dbName, dbVersion, tbsObj) {
        this._dbFactory = window.indexedDB || window.msIndexedDB;
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tbsObj = tbsObj;
    }
    Open() {
        let request = this._dbFactory.open(this.dbName, this.dbVersion);
        request.onupgradeneeded = (evt) => {
            let db = evt.currentTarget.result;
            this._db = db;
            this.tbsObj.forEach(item => {
                if (db.objectStoreNames.contains(item.TableName)) {
                    db.deleteObjectStore(item.TableName);
                }
                let store = db.createObjectStore(item.TableName, { autoIncrement: true });
                if (item.IndexDefines) {
                    item.IndexDefines.forEach(indexItem => {
                        store.createIndex(indexItem.IndexName, indexItem.FieldName, { unique: indexItem.IsUnique });
                    });
                }
            });
        };
        return new Promise((resolve, reject) => {
            request.onsuccess = (ev) => {
                this._db = ev.target.result;
                resolve(this._db);
            };
            request.onerror = (evt) => {
                reject(evt);
            };
        });
    }
    GetTransaction(tbNames, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._db) {
                this._db = yield this.Open();
            }
            return this._db.transaction(tbNames, mode.Value);
        });
    }
    GetStore(tbName, trans) {
        return trans.objectStore(tbName);
    }
    GetStoreIndex(store, indexName) {
        return store.index(indexName);
    }
    GetIndexCursor(index, fn, range) {
        index.openCursor(range).onsuccess = (evt) => {
            fn(evt.target.result);
        };
    }
    GetCursor(store, fn, range) {
        store.openCursor(range).onsuccess = (evt) => {
            fn(evt.target.result);
        };
    }
    GetById(store, value, fn) {
        let index = store.index("Id");
        let dbRequest = store.get(value);
        dbRequest.onsuccess = (evt) => {
            fn && fn(evt.target.result);
        };
    }
    Close() {
        this._db.close();
    }
    DeleteDataBase(dbName) {
        this._dbFactory.deleteDatabase(dbName);
    }
}
exports.LocalIndexedDB = LocalIndexedDB;
class DBTranscationModel {
    constructor(name, value) {
        this._name = name;
        this._value = value;
    }
    get Name() {
        return this._name;
    }
    get Value() {
        return this._value;
    }
}
DBTranscationModel.ReadOnly = new DBTranscationModel("只读", "readonly");
DBTranscationModel.Readwrite = new DBTranscationModel("读写", "readwrite");
DBTranscationModel.Versionchange = new DBTranscationModel("版本变更", "versionchange");
exports.DBTranscationModel = DBTranscationModel;
//# sourceMappingURL=indexedDB.js.map