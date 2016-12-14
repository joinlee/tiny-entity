import { ITableDefine } from '../tinyDB';
export class LocalIndexedDB {
    private _dbFactory: IDBFactory;
    private _db: IDBDatabase;

    private dbName: string;
    private dbVersion: number;
    private tbsObj: ITableDefine[];

    constructor(dbName: string, dbVersion: number, tbsObj: ITableDefine[]) {
        this._dbFactory = window.indexedDB || (<any>window).msIndexedDB;
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tbsObj = tbsObj;
    }
    /**
     * 打开数据库
     * @param  {string} dbName
     * @param  {number} dbVersion
     * @param  {ITableDefine[]} tbsObj
     */
    Open() {
        let request: IDBOpenDBRequest = this._dbFactory.open(this.dbName, this.dbVersion);
        /**
         * when version changed do this function 
         * you can edit the version property call
        */
        request.onupgradeneeded = (evt: any) => {
            let db: IDBDatabase = evt.currentTarget.result;
            this._db = db;

            //创建表结构和对应的索引
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
        }

        return new Promise<IDBDatabase>((resolve, reject) => {
            request.onsuccess = (ev: any) => {
                this._db = ev.target.result;
                resolve(this._db);
            }
            request.onerror = (evt: any) => {
                reject(evt);
            }
        })
    }

    /**
    * 获取一个事务
    * @param  {[string]} tbNames 表名称列表
    * @param  {DBTranscationModel} mode
    * @returns IDBTransaction
    */
    async GetTransaction(tbNames: string[], mode: DBTranscationModel): Promise<IDBTransaction> {
        if (!this._db) {
            this._db = await this.Open();
        }
        return this._db.transaction(tbNames, mode.Value);

    }

    /**
     * @param  {string} tbName
     * @param  {IDBTransaction} trans
     * @returns IDBObjectStore
     */
    GetStore(tbName: string, trans: IDBTransaction): IDBObjectStore {
        return trans.objectStore(tbName);
    }
    /**
     * @param  {IDBObjectStore} store
     * @param  {string} indexName
     */
    GetStoreIndex(store: IDBObjectStore, indexName: string): IDBIndex {
        return store.index(indexName);
    }
    /**
     * @param  {IDBIndex} index
     * @param  {(x:IDBCursor)=>void} fn
     * @param  {IDBKeyRange} range?
     * @returns void
     */
    GetIndexCursor(index: IDBIndex, fn: (x: IDBCursor) => void, range?: IDBKeyRange): void {
        index.openCursor(range).onsuccess = (evt: any) => {
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
    GetCursor(store: IDBObjectStore, fn: (x: IDBCursor) => void, range?: IDBKeyRange): void {
        store.openCursor(range).onsuccess = (evt: any) => {
            fn(evt.target.result);
        }
    }
    /**
     * @param  {IDBObjectStore} store
     * @param  {any} value
     * @param  {any} fn?
     * @returns void
     */
    GetById(store: IDBObjectStore, value, fn?): void {
        let index = store.index("Id");
        let dbRequest = store.get(value);
        dbRequest.onsuccess = (evt: any) => {
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
    DeleteDataBase(dbName: string) {
        this._dbFactory.deleteDatabase(dbName);
    }
}

export class DBTranscationModel {
    private _name: string;
    private _value: any;
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

    static ReadOnly: DBTranscationModel = new DBTranscationModel("只读", "readonly");
    static Readwrite: DBTranscationModel = new DBTranscationModel("读写", "readwrite");
    static Versionchange: DBTranscationModel = new DBTranscationModel("版本变更", "versionchange");
}


