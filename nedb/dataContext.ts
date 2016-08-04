
import Datastore = require("nedb");

export class DataContext implements IDataContext {
    private nedb: Datastore;
    private config: ContextConfig;
    private transOn: boolean;
    private transList: TransQuery[] = [];
    constructor(config: ContextConfig) {
        this.config = config;
        if (!config.IsMulitTabel) {
            this.nedb = new Datastore(config.FilePath + config.DBName);
            this.nedb.loadDatabase();
        }
    }


    async Create(obj: IEntityObject, stillOpen: boolean = true): Promise<Object> {
        delete (obj as any).ctx;
        let promise = new Promise((resolve, reject) => {
            this.createInner(obj, stillOpen).then((r) => {
                //添加事务的记录
                this.pushQuery("create", obj);
                resolve(r);
            })
                .catch(err => {
                    if (err.errorType == "uniqueViolated") {
                        reject("插入失败：重复的主键id");
                    } else
                        reject(err);
                })
        });

        return promise;
    }
    private async createInner(obj: IEntityObject, stillOpen) {
        let db = await this.Open(obj.toString(), stillOpen);
        return new Promise((resolve, reject) => {
            db.insert(obj, (err, r) => {
                if (err) reject(err);
                else {
                    resolve(r);
                }
            });
        });
    }

    async Update(obj: IEntityObject, stillOpen: boolean = true) {
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
    private async UpdateInner(obj: IEntityObject, stillOpen) {
        delete (<any>obj)._id;
        let db = await this.Open(obj.toString(), stillOpen);

        return new Promise((resolve, reject) => {
            db.update({ id: obj.id }, obj, { upsert: false }, (err, numReplaced: number, upsert) => {
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
        let db = await this.Open(name, stillOpen);
        return new Promise((resolve, reject) => {
            db.findOne({ id: id }, (err, r) => {
                if (err) reject(err);
                else resolve(r);
            });
        });
    }

    async Delete(obj: IEntityObject, stillOpen: boolean = true): Promise<boolean> {
        let entity;
        if (this.transOn) {
            entity = await this.getEntity(obj.toString(), obj.id, stillOpen);
            entity.toString = obj.toString;
        }

        let promise = new Promise<boolean>((resolve, reject) => {
            this.deleteInner(obj, stillOpen).then(() => {
                this.pushQuery("delete", entity);
                resolve(true);
            }).catch(err => {
                reject(err);
            });
        });

        return promise;
    }
    private async deleteInner(obj: IEntityObject, stillOpen) {
        let db = await this.Open(obj.toString(), stillOpen);
        let promise = new Promise<boolean>((resolve, reject) => {
            db.remove({ id: obj.id }, {}, (err, numRemoved) => {
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
    async Query(qFn: [((p) => Boolean)], tableName: string, queryMode: QueryMode = QueryMode.Normal, orderByFn?, inqObj?): Promise<any> {
        let db = await this.Open(tableName);
        let promise = new Promise((resolve, reject) => {
            let queryFn = {};
            if (qFn) {
                queryFn = {
                    $where: function () {
                        try {
                            let r = true;
                            for (let i = 0; i < qFn.length; i++) {
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

    private Open(tbName: string, stillOpen): Promise<Datastore> {
        // if (this.config.IsMulitTabel) {
        //     // let _db = this.dbLinks.find(x => x.key == tbName);
        //     // if (_db) return _db.db;
        //     // else {
        //     //     let db: Datastore = new Datastore({ filename: this.config.FilePath + tbName + ".db", autoload: true });
        //     //     db.loadDatabase((err) => {
        //     //         console.log("数据库打开失败：" + tbName, err);
        //     //     });
        //     //     this.dbLinks.push({ key: tbName, db: db });
        //     //     return db;
        //     // }

        // }
        // else {
        //     return this.nedb;
        // }


        let openDBTask = (cb) => {
            clearInterval(timer);
            let dbc = new Datastore(this.config.FilePath + tbName + ".db");
            dbc.loadDatabase((err) => {
                if (err) timer = setInterval(openDBTask, 200);
                else {
                    console.log("数据库打开成功！ ====================>", tbName);
                    clearInterval(timer);
                    cb(dbc);
                }
            });
        }

        return new Promise((resolve, reject) => {
            let db = new Datastore({
                filename: this.config.FilePath + tbName + ".db",
                inMemoryOnly: false,
                autoload: true,
                onload: (err) => {
                    if (err) {
                        if (stillOpen) {
                            reject(err);
                        }
                        else {
                            console.log("==================> 数据库打开失败：启动open task" + tbName);
                            timer = setInterval(openDBTask, 200, resolve);
                        }
                    }
                    else {
                        db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
                            if (err) console.log("添加索引失败：", err);
                        });
                        resolve(db);
                    }
                }
            });

            (<any>db).persistence.setAutocompactionInterval(120 * 60 * 1000);
        });
    }

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

interface ContextConfig {
    IsMulitTabel?: boolean;
    FilePath: string;
    DBName: string
}
interface TransQuery {
    key: string;
    entity: IEntityObject;
}

export function Transaction(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = async function () {
        console.log("BeginTranscation propertyName:", propertyName);
        this.ctx.BeginTranscation();
        let result;
        try {
            result = await method.apply(this, arguments);
            this.ctx.Commit();
            return result;
        } catch (error) {
            console.log("RollBack propertyName:", propertyName);
            await this.ctx.RollBack();

            throw error;
        }
    }
}