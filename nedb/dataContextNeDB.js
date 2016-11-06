"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Datastore = require("nedb");
const dbOpenWorker_1 = require("./dbOpenWorker");
var dbconfig;
class DataContext {
    constructor(config) {
        this.transList = [];
        this.dbLinks = [];
        this.config = config;
        dbconfig = config;
        if (!config.IsMulitTabel) {
            this.nedb = new Datastore(config.FilePath + config.DBName);
            this.nedb.loadDatabase();
        }
    }
    Create(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stillOpen == undefined || stillOpen == null)
                stillOpen = true;
            delete obj.ctx;
            let promise = new Promise((resolve, reject) => {
                this.createInner(obj, stillOpen).then((r) => {
                    this.pushQuery("create", obj);
                    resolve(r);
                })
                    .catch(err => {
                    if (err.errorType == "uniqueViolated") {
                        reject({ code: -101, message: "插入失败：重复的主键id" });
                    }
                    else
                        reject(err);
                });
            });
            return promise;
        });
    }
    createInner(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.Open(obj.toString(), stillOpen);
            return new Promise((resolve, reject) => {
                db.insert(obj, (err, r) => {
                    if (err)
                        reject(err);
                    else {
                        resolve(r);
                    }
                });
            });
        });
    }
    UpdateRange(list, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stillOpen == undefined || stillOpen == null)
                stillOpen = true;
            let entityList = [];
            return new Promise((resolve, reject) => {
                try {
                    for (var index = 0, l = list.length; index < l; index++) {
                        var element = list[index];
                        this.Update(element).then(v => {
                            entityList.push(v);
                            if (entityList.length == l) {
                                resolve(entityList);
                            }
                        }).catch(err => { new Error(err); });
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    Update(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stillOpen == undefined || stillOpen == null)
                stillOpen = true;
            delete obj.ctx;
            let entity;
            if (this.transOn) {
                entity = yield this.getEntity(obj.toString(), obj.id, stillOpen);
                entity.toString = obj.toString;
            }
            return new Promise((resolve, reject) => {
                this.UpdateInner(obj, stillOpen).then(r => {
                    this.pushQuery("update", entity);
                    resolve(r);
                }).catch(err => {
                    reject(err);
                });
            });
        });
    }
    UpdateInner(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            delete obj._id;
            let db = yield this.Open(obj.toString(), stillOpen);
            return new Promise((resolve, reject) => {
                db.update({ id: obj.id }, obj, { upsert: false }, (err, numReplaced, upsert) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(obj);
                    }
                });
            });
        });
    }
    getEntity(name, id, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.Open(name, stillOpen);
            return new Promise((resolve, reject) => {
                db.findOne({ id: id }, (err, r) => {
                    if (err)
                        reject(err);
                    else
                        resolve(r);
                });
            });
        });
    }
    Delete(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stillOpen == undefined || stillOpen == null)
                stillOpen = true;
            let entity;
            if (this.transOn) {
                entity = yield this.getEntity(obj.toString(), obj.id, stillOpen);
                entity.toString = obj.toString;
            }
            let promise = new Promise((resolve, reject) => {
                this.deleteInner(obj, stillOpen).then(() => {
                    this.pushQuery("delete", entity);
                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
            return promise;
        });
    }
    deleteInner(obj, stillOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.Open(obj.toString(), stillOpen);
            let promise = new Promise((resolve, reject) => {
                db.remove({ id: obj.id }, {}, (err, numRemoved) => {
                    if (err)
                        reject(err);
                    else {
                        resolve(true);
                    }
                });
            });
            return promise;
        });
    }
    BeginTranscation() {
        this.transOn = true;
    }
    Commit() {
        console.log("Commit this.transOn:", this.transOn);
        if (this.transOn) {
            this.transList = [];
            this.transOn = false;
        }
        ;
    }
    Query(qFn, tableName, queryMode, orderByFn, inqObj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryMode == undefined || queryMode == null)
                queryMode = QueryMode.Normal;
            let db = yield this.Open(tableName);
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
                            }
                            catch (error) {
                                return false;
                            }
                        }
                    };
                }
                switch (queryMode) {
                    case QueryMode.Normal:
                        db.find(queryFn, (err, r) => {
                            if (err)
                                reject(err);
                            else
                                resolve(r);
                        });
                        break;
                    case QueryMode.Count:
                        db.count(queryFn, (err, r) => {
                            if (err)
                                reject(err);
                            else
                                resolve(r);
                        });
                        break;
                    case QueryMode.First:
                        db.findOne(queryFn, (err, r) => {
                            if (err)
                                reject(err);
                            else
                                resolve(r);
                        });
                        break;
                    case QueryMode.Contains:
                        let inq = {};
                        inq[inqObj.feildName] = {
                            $in: inqObj.value
                        };
                        db.find(inq, (err, r) => {
                            if (err)
                                reject(err);
                            else
                                resolve(r);
                        });
                        break;
                }
            });
            return promise;
        });
    }
    Open(tbName, stillOpen) {
        return new Promise((resolve, reject) => {
            let db = new Datastore({
                filename: this.config.FilePath + tbName + ".db",
                inMemoryOnly: false,
                autoload: true,
                onload: (err) => {
                    if (err) {
                        if (err.errorType == "uniqueViolated")
                            reject(err);
                        else {
                            console.log("启动open task:" + tbName);
                            dbOpenWorker_1.OpenWorkerManager.Current.Task(new dbOpenWorker_1.DBOpenWorker({ path: dbconfig.FilePath + tbName + ".db" }, resolve));
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
    RollBack() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.transOn) {
                try {
                    for (let index = this.transList.length - 1; index >= 0; index--) {
                        let item = this.transList[index];
                        console.log(item);
                        switch (item.key) {
                            case "create":
                                yield this.deleteInner(item.entity);
                                break;
                            case "update":
                                yield this.UpdateInner(item.entity);
                                break;
                            case "delete":
                                yield this.createInner(item.entity);
                                break;
                        }
                    }
                }
                catch (error) {
                    console.log("回滚失败");
                }
                finally {
                    this.transList = [];
                }
            }
        });
    }
    pushQuery(key, obj) {
        if (this.transOn) {
            this.transList.push({
                key: key,
                entity: obj
            });
        }
    }
}
exports.DataContext = DataContext;
let timer;
(function (QueryMode) {
    QueryMode[QueryMode["Normal"] = 0] = "Normal";
    QueryMode[QueryMode["First"] = 1] = "First";
    QueryMode[QueryMode["Count"] = 2] = "Count";
    QueryMode[QueryMode["Contains"] = 3] = "Contains";
})(exports.QueryMode || (exports.QueryMode = {}));
var QueryMode = exports.QueryMode;
function Transaction(target, propertyName, descriptor) {
    let method = descriptor.value;
    descriptor.value = function () {
        return __awaiter(this, arguments, void 0, function* () {
            console.log("BeginTranscation propertyName:", propertyName);
            this.ctx.BeginTranscation();
            let result;
            try {
                result = yield method.apply(this, arguments);
                this.ctx.Commit();
                return result;
            }
            catch (error) {
                console.log("RollBack propertyName:", propertyName);
                yield this.ctx.RollBack();
                throw error;
            }
        });
    };
}
exports.Transaction = Transaction;
//# sourceMappingURL=dataContextNeDB.js.map