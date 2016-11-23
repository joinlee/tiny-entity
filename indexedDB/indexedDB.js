"use strict";
class LocalIndexedDB {
    constructor() {
        this._dbFactory = window.indexedDB || window.msIndexedDB;
    }
    Open(dbName, dbVersion, tbsObj) {
        let request = this._dbFactory.open(dbName, dbVersion);
        request.onerror = (evt) => {
            throw evt;
        };
        request.onupgradeneeded = (evt) => {
            let db = evt.currentTarget.result;
            this._db = db;
            tbsObj.forEach(item => {
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
        request.onsuccess = (ev) => {
            this._db = ev.target.result;
        };
    }
    GetTransaction(tbNames, mode) {
        return (() => { return this._db.transaction(tbNames, mode.Value); })();
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
exports.DBTranscationModel = DBTranscationModel;
DBTranscationModel.ReadOnly = new DBTranscationModel("只读", "readonly");
DBTranscationModel.Readwrite = new DBTranscationModel("读写", "readwrite");
DBTranscationModel.Versionchange = new DBTranscationModel("版本变更", "versionchange");
//# sourceMappingURL=indexedDB.js.map