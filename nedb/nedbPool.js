"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbOpenWorker_1 = require("./dbOpenWorker");
const Datastore = require("nedb");
class NeDBPool {
    constructor() {
        this.list = [];
    }
    GetDBConnection(tbName, config) {
        let db = null;
        let connStr = config.FilePath + tbName + ".db";
        let item = this.list.find(x => x.connStr == connStr);
        return new Promise((resolve, reject) => {
            if (item) {
                resolve(item.db);
            }
            else {
                this.Open(connStr).then(db => {
                    this.list.push({ connStr: connStr, db: db });
                    resolve(db);
                }).catch(err => { reject(err); });
            }
        });
    }
    Open(connStr) {
        return new Promise((resolve, reject) => {
            let db = new Datastore({
                filename: connStr,
                inMemoryOnly: false,
                autoload: true,
                onload: (err) => {
                    if (err) {
                        if (err.errorType == "uniqueViolated")
                            reject(err);
                        else {
                            console.log("启动open task:" + connStr);
                            dbOpenWorker_1.OpenWorkerManager.Current.Task(new dbOpenWorker_1.DBOpenWorker({ path: connStr }, resolve));
                        }
                    }
                    else {
                        db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
                            if (err)
                                console.log("添加索引失败：", err);
                        });
                        resolve(db);
                    }
                }
            });
            db.persistence.setAutocompactionInterval(120 * 60 * 1000);
        });
    }
}
NeDBPool.Current = new NeDBPool();
exports.NeDBPool = NeDBPool;
//# sourceMappingURL=nedbPool.js.map