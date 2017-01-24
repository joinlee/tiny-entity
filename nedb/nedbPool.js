"use strict";
var dbOpenWorker_1 = require("./dbOpenWorker");
var Datastore = require("nedb");
var NeDBPool = (function () {
    function NeDBPool() {
        this.list = [];
    }
    NeDBPool.prototype.GetDBConnection = function (tbName, config) {
        var _this = this;
        var db = null;
        var connStr = config.FilePath + tbName + ".db";
        var item = this.list.find(function (x) { return x.connStr == connStr; });
        return new Promise(function (resolve, reject) {
            if (item) {
                resolve(item.db);
            }
            else {
                _this.Open(connStr).then(function (db) {
                    _this.list.push({ connStr: connStr, db: db });
                    resolve(db);
                }).catch(function (err) { reject(err); });
            }
        });
    };
    NeDBPool.prototype.Open = function (connStr) {
        return new Promise(function (resolve, reject) {
            var db = new Datastore({
                filename: connStr,
                inMemoryOnly: false,
                autoload: true,
                onload: function (err) {
                    if (err) {
                        if (err.errorType == "uniqueViolated")
                            reject(err);
                        else {
                            console.log("启动open task:" + connStr);
                            dbOpenWorker_1.OpenWorkerManager.Current.Task(new dbOpenWorker_1.DBOpenWorker({ path: connStr }, resolve));
                        }
                    }
                    else {
                        db.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
                            if (err)
                                console.log("添加索引失败：", err);
                        });
                        resolve(db);
                    }
                }
            });
            db.persistence.setAutocompactionInterval(120 * 60 * 1000);
        });
    };
    return NeDBPool;
}());
NeDBPool.Current = new NeDBPool();
exports.NeDBPool = NeDBPool;
//# sourceMappingURL=nedbPool.js.map