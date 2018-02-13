import Datastore = require("nedb");
import { DBOpenWorker, OpenWorkerManager } from "./dbOpenWorker";
import { IEntityObject, IDataContext } from '../tinyDB';
var dbconfig;
import { NeDBPool } from './nedbPool';

String.prototype.IndexOf = function (str: string) {
    return this.indexOf(str) > -1;
}

export class NeDBDataContext implements IDataContext {
    Delete(obj: IEntityObject);
    Delete<T extends IEntityObject>(obj: IEntityObject, func: (x: T) => boolean, paramsKey: string[], paramsValue: any[]);
    async Delete(obj: any, func?: any, paramsKey?: any, paramsValue?: any) {
        let entity;
        if (this.transOn) {
            entity = await this.getEntity(obj.toString(), obj.id, true);
            entity.toString = obj.toString;
        }

        let promise = new Promise<boolean>((resolve, reject) => {
            this.deleteInner(obj, true, false).then(() => {
                this.pushQuery("delete", entity);
                resolve(true);
            }).catch(err => {
                reject(err);
            });
        });

        return promise;
    }
    private nedb: Datastore;
    private config: ContextConfig;
    private transOn: boolean;
    private transList: TransQuery[] = [];
    constructor(config: ContextConfig) {
        this.config = config;
        dbconfig = config;
        if (!config.IsMulitTabel) {
            this.nedb = new Datastore(config.FilePath + config.DBName);
            this.nedb.loadDatabase();
        }
    }

    Create(obj: IEntityObject, exclude?: string[])
    async Create(obj: IEntityObject, exclude?: string[], stillOpen?: boolean): Promise<Object> {
        if (stillOpen == undefined || stillOpen == null) stillOpen = true;
        delete (obj as any).ctx;
        let promise = new Promise((resolve, reject) => {
            this.createInner(obj, stillOpen).then((r) => {
                //添加事务的记录
                this.pushQuery("create", obj);
                resolve(r);
            })
                .catch(err => {
                    if (err.errorType == "uniqueViolated") {
                        reject({ code: -101, message: "插入失败：重复的主键id" });
                    } else
                        reject(err);
                })
        });

        return promise;
    }
    private async createInner(obj: IEntityObject, stillOpen?) {
        // let db = await this.Open(obj.toString(), stillOpen);
        let db = await NeDBPool.Current.GetDBConnection(obj.toString(), this.config);
        return new Promise((resolve, reject) => {
            db.insert(obj, (err, r) => {
                if (err) reject(err);
                else {
                    resolve(r);
                }
            });
        });
    }

    async UpdateRange(list: [IEntityObject], stillOpen?: boolean) {
        if (stillOpen == undefined || stillOpen == null) stillOpen = true;
        let entityList = [];
        return new Promise((resolve, reject) => {
            try {
                for (var index = 0, l = list.length; index < l; index++) {
                    var element = list[index];
                    this.Update(element).then(v => {
                        entityList.push(v);
                        if (entityList.length == l) {
                            resolve(entityList)
                        }
                    }).catch(err => { new Error(err); });
                }

            } catch (error) {
                reject(error);
            }

        });
    }

    Update(obj: IEntityObject, exclude?: string[]);
    async Update(obj: IEntityObject, exclude?: string[], stillOpen?: boolean) {
        if (stillOpen == undefined || stillOpen == null) stillOpen = true;
        delete (obj as any).ctx;
        let entity;
        if (this.transOn) {
            entity = await this.getEntity(obj.toString(), obj.id, stillOpen);
            entity.toString = obj.toString;
        }

        return new Promise((resolve, reject) => {
            this.UpdateInner(obj, stillOpen).then(r => {
                this.pushQuery("update", entity);
                resolve(r);
            }).catch(err => {
                reject(err);
            })
        });
    }
    private async UpdateInner(obj: IEntityObject, stillOpen?) {
        delete (<any>obj)._id;
        // let db = await this.Open(obj.toString(), stillOpen);
        let db = await NeDBPool.Current.GetDBConnection(obj.toString(), this.config);

        return new Promise((resolve, reject) => {
            db.update({ id: obj.id }, obj, { upsert: true }, (err, numReplaced: number, upsert) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(obj);
                }
            });
        })
    }

    private async getEntity(name, id, stillOpen) {
        // let db = await this.Open(name, stillOpen);
        let db = await NeDBPool.Current.GetDBConnection(name, this.config);
        return new Promise((resolve, reject) => {
            db.findOne({ id: id }, (err, r) => {
                if (err) reject(err);
                else resolve(r);
            });
        });
    }

    private async deleteInner(obj: IEntityObject, stillOpen?, isAll?: boolean) {
        let db = await NeDBPool.Current.GetDBConnection(obj.toString(), this.config);
        let promise = new Promise<boolean>((resolve, reject) => {
            let queryParam: any = { id: obj.id };
            let removeOpt = {}
            if (isAll) {
                queryParam = {};
                removeOpt = { multi: true };
            }
            db.remove(queryParam, removeOpt, (err, numRemoved) => {
                if (err) reject(err);
                else {
                    resolve(true);
                }
            });
        });

        return promise;
    }

    BeginTranscation() {
        this.transOn = true;
    }
    Commit() {
        console.log("Commit this.transOn:", this.transOn);
        if (this.transOn) {
            this.transList = [];
            this.transOn = false;
        };
    }
    async Query(qFn: [((p) => Boolean)], tableName: string, queryMode?: QueryMode, orderByFn?, inqObj?): Promise<any> {
        if (queryMode == undefined || queryMode == null) queryMode = QueryMode.Normal
        // let db = await this.Open(tableName);
        let db = await NeDBPool.Current.GetDBConnection(tableName, this.config);
        let promise = new Promise((resolve, reject) => {
            let queryFn = {};
            if (qFn) {
                queryFn = {
                    $where: function () {
                        try {
                            let r = true;
                            for (let i = 0; i < qFn.length; i++) {
                                if (qFn[i] == null || qFn[i] == undefined)
                                    break;
                                if (!qFn[i](this)) {
                                    r = false;
                                    break;
                                }
                            }

                            return r;
                        } catch (error) {
                            return false;
                        }
                    }
                }
            }
            switch (queryMode) {
                case QueryMode.Normal:
                    db.find(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.Count:
                    db.count(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.First:
                    db.findOne(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.Contains:
                    let inq = {};
                    inq[inqObj.feildName] = {
                        $in: inqObj.value
                    }
                    db.find(inq, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
            }
        });

        return promise;
    }

    private dbLinks = [];

    async RollBack() {
        if (this.transOn) {
            try {
                for (let index = this.transList.length - 1; index >= 0; index--) {
                    let item = this.transList[index];
                    console.log(item);

                    switch (item.key) {
                        case "create":
                            await this.deleteInner(item.entity);
                            break;
                        case "update":
                            await this.UpdateInner(item.entity);
                            break;
                        case "delete":
                            await this.createInner(item.entity);
                            break;
                    }
                }
            } catch (error) {
                console.log("回滚失败");
            }
            finally {
                this.transList = [];
            }
        }
    }
    private pushQuery(key, obj) {
        if (this.transOn) {
            this.transList.push({
                key: key,
                entity: obj
            });
        }
    }
}

let timer;

export enum QueryMode {
    Normal,
    First,
    Count,
    Contains
}

export interface ContextConfig {
    IsMulitTabel?: boolean;
    FilePath: string;
    DBName: string;
    timestampData?: boolean;
}
interface TransQuery {
    key: string;
    entity: IEntityObject;
}