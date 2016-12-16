import { LocalIndexedDB, DBTranscationModel } from "./indexedDB";
import { IDataContext, ITableDefine, IEntityObject } from '../tinyDB';

export class IndexedDBDataContext implements IDataContext {
    private db: LocalIndexedDB;
    private tableDefines;
    private dbName: string;
    private dbVersion: number = 0;

    constructor(dbName: string, dbVersion: number, tableDefines: ITableDefine[]) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.tableDefines = tableDefines;
        this.db = new LocalIndexedDB(this.dbName, this.dbVersion, this.tableDefines);
    }

    /**
     * 查询暂存器
     */
    private _qScratchpad: IQueryScratchpad[] = [];
    /**
     * 添加实体对象到数据库
     * @param  {DataEngine.IEntityObject} obj 实体对象
     * @param  {any} callback? 回调函数
     * @returns 
     */
    Create(obj: IEntityObject) {
        return new Promise<any>((resolve, reject) => {
            this.ExcuteQuery([{
                QueryAction: QueryActionType.Insert,
                TableName: obj.toString(),
                EntityObject: obj,
                ResultCallback: (r) => {
                    resolve(r);
                }
            }])
        });

    }

    /**
     * 通过实体对象删除数据
     * 调用 Delete 删除后需要 调用 OnSubmit 函数提交并执行删除操作
     * @param  {DataEngine.IEntityObject} obj 实体兑现
     * @param  {any} callback? 回调函数
     * @returns 
     */
    Delete(obj: IEntityObject) {
        return new Promise<any>((resolve, reject) => {
            this.ExcuteQuery([{
                QueryAction: QueryActionType.Delete,
                TableName: obj.toString(),
                EntityObject: obj,
                ResultCallback: (r) => {
                    resolve(r);
                }
            }])
        });
    };

    /**
     * 清空当前表的所有数据
     * 
     * @param {string} tbName
     * @returns
     * 
     * @memberOf IndexedDBDataContext
     */
    async Clear(tbName: string) {
        let trans = await this.db.GetTransaction([tbName], DBTranscationModel.Readwrite);

        let store = this.db.GetStore(tbName, trans);
        return new Promise((resolve, reject) => {
            let request = store.clear();
            request.onsuccess = (evt) => {
                resolve(evt);
            }
            request.onerror = (evt) => {
                reject(evt);
            }
        });
    }

    /**
     * 
     * 更新数据
     * @param  {DataEngine.IEntityObject} obj 实体对象
     * @param  {any} callback? 回调函数
     * 
     * @memberOf IndexedDBDataContext
     */
    Update(obj: IEntityObject) {
        return new Promise<any>((resolve, reject) => {
            this.ExcuteQuery([{
                QueryAction: QueryActionType.Update,
                TableName: obj.toString(),
                EntityObject: obj,
                ResultCallback: (r) => {
                    resolve(r);
                }
            }])
        });
    }
    /**
     * 添加查询到查询暂存器
     * @param  {string} tbName 表名称
     * @param  {QueryActionType} qActionType 查询类型
     * @param  {any} queryFunction 查询条件函数
     * @returns void
     */
    AddQueryScratchpad(tbName: string, qActionType: QueryActionType, queryFunction): void {
        this._qScratchpad.push({
            QueryAction: qActionType,
            TableName: tbName,
            QueryFunction: queryFunction
        });
    }
    /**
     * 提交查询
     * @param  {any} queryCallback? 查询结果集回调函数
     * @returns void
     */
    OnSubmit(queryCallback?, tableName?: string) {
        if (this._qScratchpad.length == 0) {
            this.AddQueryScratchpad(tableName, QueryActionType.SelectAll, null);
        }
        return this.ExcuteQuery(this._qScratchpad, queryCallback);
    }
    /**
     * 执行查询
     * @param  {IQueryScratchpad[]} qs 查询暂存器列表
     * @param  {any} queryCallback? 查询结果集回调
     * @returns void
     */
    private async ExcuteQuery(qs: IQueryScratchpad[], queryCallback?) {
        if (qs && qs.length > 0) {
            let trans = await this.GetTranscationByQuery(qs);

            qs.forEach(ii => {
                let dbRequest, store = trans.objectStore(ii.TableName);
                if (ii.QueryAction == QueryActionType.Insert) {
                    let o = JSON.parse(JSON.stringify(ii.EntityObject));
                    dbRequest = store.add(o);
                    dbRequest.onsuccess = (evt: any) => {
                        //插入数据后返回的自动id
                        let rId = evt.target.result;

                        ii.ResultCallback && ii.ResultCallback(rId);
                    }
                }
                else if (ii.QueryAction == QueryActionType.Update) {
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
                        if (cursor) {
                            if (cursor.value.id == ii.EntityObject.id) {
                                let p: any = ii.EntityObject;
                                delete p.ctx;

                                let o = this.copy(cursor.value, p);

                                cursor.update(o);
                            }
                            else cursor.continue();
                        }
                        else {
                            queryCallback && queryCallback(true);
                        }
                    });
                }
                else if (ii.QueryAction == QueryActionType.Delete) {
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
                        if (cursor) {
                            if (cursor.value.id == ii.EntityObject.id) {
                                let idbQuest: IDBRequest = cursor.delete();
                                idbQuest.onerror = (evt: any) => {
                                    console.log(evt);
                                }
                            }
                            else cursor.continue();
                        }
                        else {
                            queryCallback && queryCallback(true);
                        }
                    });
                }
                else if (ii.QueryAction == QueryActionType.Select) {
                    let resultAssemble = [];
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
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
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
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
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
                        if (cursor) {
                            if (ii.QueryFunction(cursor.value)) {
                                queryCallback && queryCallback(true);
                            }
                            else cursor.continue();
                        }
                        else {
                            queryCallback && queryCallback(false);
                        }
                    });
                }
                else if (ii.QueryAction == QueryActionType.SelectCount) {
                    let countResult = 0;
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
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
                    this.db.GetIndexCursor(store.index("id"), (cursor: any) => {
                        if (cursor) {
                            let r = cursor.value;
                            if (ii.QueryFunction(r)) queryCallback && queryCallback(r);
                            else cursor.continue();
                        }
                        else queryCallback && queryCallback(null);
                    });
                }
            });

            this._qScratchpad = [];

            trans.oncomplete = () => {
                this._qScratchpad = [];
                // console.log("trans.oncomplete:" + new Date().toUTCString());
            }
            trans.onerror = (evt: any) => {
                // console.log("trans.onerror this._qScratchpad", qs);
                this._qScratchpad = [];
                console.error("trans.onerror", evt);
            }
        }
    }

    private copy(s, d) {
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
    /**
     * 查询当前表最大的计数器索引
     * @param  {string} tbName 表名称
     * @returns IDBRequest 查询结果
     */
    private async GetMaxIdentity(tbName: string): Promise<number> {
        let dbMode: DBTranscationModel = DBTranscationModel.ReadOnly;
        let trans = await this.db.GetTransaction([tbName], dbMode);
        let store = this.db.GetStore(tbName, trans);

        let request = store.count();
        return new Promise<number>((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            }
        });
    }

    /**
     * 根据查询暂存器生成事务
     * @param  {IQueryScratchpad[]} qs 查询暂存器列表
     * @returns IDBTransaction 事务
     */
    private GetTranscationByQuery(qs: IQueryScratchpad[]) {
        let dbMode: DBTranscationModel = DBTranscationModel.ReadOnly;
        let tbNames: string[] = [];
        qs.forEach(ii => {
            tbNames.push(ii.TableName);
            if (ii.QueryAction == QueryActionType.Insert || ii.QueryAction == QueryActionType.Update || ii.QueryAction == QueryActionType.Delete) {
                dbMode = DBTranscationModel.Readwrite;
            }
            else if (ii.QueryAction == QueryActionType.Select) {
                dbMode = DBTranscationModel.ReadOnly;
            }
        });

        return this.db.GetTransaction(tbNames, dbMode);
    }

    private Clone(source: any, destination: any, isDeep?: boolean): Object {
        if (!source) return null;
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

    BeginTranscation() { };
    Commit() { };
    Query(...args) { };
    RollBack() { };
}

interface IQueryScratchpad {
    TableName: string;
    QueryAction: QueryActionType;
    EntityObject?: IEntityObject;
    ResultCallback?;
    ErrorCallback?;
    QueryFunction?;
}

export enum QueryActionType {
    Insert,
    Update,
    Delete,
    Select,
    SelectAny,
    SelectCount,
    SelectFirst,
    SelectAll
}