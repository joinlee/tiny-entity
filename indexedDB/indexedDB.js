"use strict";
///<reference path="typings/tinyDB.d.ts" />
class LocalIndexedDB {
    constructor() {
        this._dbFactory = window.indexedDB || window.msIndexedDB;
    }
    /**
     * 打开数据库
     * @param  {string} dbName
     * @param  {number} dbVersion
     * @param  {ITableDefine[]} tbsObj
     */
    Open(dbName, dbVersion, tbsObj) {
        let request = this._dbFactory.open(dbName, dbVersion);
        request.onerror = (evt) => {
            throw evt;
        };
        /**
         * when version changed do this function
         * you can edit the version property call
        */
        request.onupgradeneeded = (evt) => {
            let db = evt.currentTarget.result;
            this._db = db;
            //创建表结构和对应的索引
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
    /**
    * 获取一个事务
    * @param  {[string]} tbNames 表名称列表
    * @param  {DBTranscationModel} mode
    * @returns IDBTransaction
    */
    GetTransaction(tbNames, mode) {
        return (() => { return this._db.transaction(tbNames, mode.Value); })();
    }
    /**
     * @param  {string} tbName
     * @param  {IDBTransaction} trans
     * @returns IDBObjectStore
     */
    GetStore(tbName, trans) {
        return trans.objectStore(tbName);
    }
    /**
     * @param  {IDBObjectStore} store
     * @param  {string} indexName
     */
    GetStoreIndex(store, indexName) {
        return store.index(indexName);
    }
    /**
     * @param  {IDBIndex} index
     * @param  {(x:IDBCursor)=>void} fn
     * @param  {IDBKeyRange} range?
     * @returns void
     */
    GetIndexCursor(index, fn, range) {
        index.openCursor(range).onsuccess = (evt) => {
            fn(evt.target.result);
        };
    }
    /**
     *
     * @param  {IDBObjectStore} store
     * @param  {(x:IDBCursor)=>void} fn
     * @param  {IDBKeyRange} range?
     * @returns void
     */
    GetCursor(store, fn, range) {
        store.openCursor(range).onsuccess = (evt) => {
            fn(evt.target.result);
        };
    }
    /**
     * @param  {IDBObjectStore} store
     * @param  {any} value
     * @param  {any} fn?
     * @returns void
     */
    GetById(store, value, fn) {
        let index = store.index("Id");
        let dbRequest = store.get(value);
        dbRequest.onsuccess = (evt) => {
            fn && fn(evt.target.result);
        };
    }
    /**
     * 关闭数据库
     */
    Close() {
        this._db.close();
    }
    /**
     * 删除数据库
     * @param  {string} dbName
     */
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
