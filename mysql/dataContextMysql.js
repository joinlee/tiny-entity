"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const entityCopier_1 = require("../entityCopier");
var mysqlPool;
class MysqlDataContext {
    constructor(option) {
        this.transactionOn = false;
        this.querySentence = [];
        if (!mysqlPool)
            mysqlPool = mysql.createPool(option);
    }
    Create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let sqlStr = "INSERT INTO " + obj.toString();
            let pt = this.propertyFormat(obj);
            sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";
            if (this.transactionOn) {
                this.querySentence.push(sqlStr);
            }
            else {
                let r = yield this.onSubmit(sqlStr);
                return entityCopier_1.EntityCopier.Decode(obj);
            }
        });
    }
    Update(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let sqlStr = "UPDATE " + obj.toString() + " SET ";
            let qList = [];
            for (var key in obj) {
                if (this.isAvailableValue(obj[key]) && key != "id") {
                    if (obj[key] == undefined || obj[key] == null || obj[key] === "") {
                        qList.push("`" + key + "`=NULL");
                    }
                    else if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                        qList.push("`" + key + "`='" + JSON.stringify(obj[key]) + "'");
                    }
                    else if (isNaN(obj[key]) || typeof (obj[key]) == "string") {
                        qList.push("`" + key + "`='" + obj[key] + "'");
                    }
                    else if (obj[key] instanceof Date) {
                        qList.push("`" + key + "`='" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                    }
                    else {
                        qList.push("`" + key + "`=" + obj[key]);
                    }
                }
            }
            sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
            if (this.transactionOn) {
                this.querySentence.push(sqlStr);
            }
            else {
                let r = yield this.onSubmit(sqlStr);
                return entityCopier_1.EntityCopier.Decode(obj);
            }
        });
    }
    Delete(obj) {
        let sqlStr = "DELETE FROM " + obj.toString() + " WHERE id='" + obj.id + "';";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    DeleteAll(obj) {
        let sqlStr = "DELETE FROM " + obj.toString() + ";";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    BeginTranscation() {
        this.transactionOn = true;
    }
    Commit() {
        if (!this.transactionOn)
            return;
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    conn.release();
                    reject(err);
                }
                conn.beginTransaction(err => {
                    if (err) {
                        conn.release();
                        reject(err);
                    }
                });
                try {
                    for (let sql of this.querySentence) {
                        let r = yield this.TrasnQuery(conn, sql);
                    }
                    conn.commit(err => {
                        if (err)
                            conn.rollback(() => {
                                conn.release();
                                reject(err);
                            });
                        this.querySentence = [];
                        this.transactionOn = false;
                        conn.release();
                        resolve(true);
                    });
                }
                catch (error) {
                    this.querySentence = [];
                    this.transactionOn = false;
                    conn.release();
                    reject(error);
                }
            }));
        });
    }
    TrasnQuery(conn, sql) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                conn.query(sql, (err, result) => {
                    if (err) {
                        console.log("TrasnQuery , hhhhhhhhhhhhhhhhh", err, sql);
                        conn.rollback(() => { reject(err); });
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
    RollBack() { }
    Query(sqlStr) {
        return this.onSubmit(sqlStr);
    }
    onSubmit(sqlStr) {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => {
                sqlStr = conn.escape(sqlStr);
                if (err) {
                    conn.release();
                    reject(err);
                }
                conn.query(sqlStr, (err, args) => {
                    conn.release();
                    if (err)
                        reject(err);
                    else
                        resolve(args);
                });
            });
        });
    }
    propertyFormat(obj) {
        const propertyNameList = [];
        const propertyValueList = [];
        for (var key in obj) {
            if (this.isAvailableValue(obj[key])) {
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx" || key == "joinParms")
                    continue;
                if (obj[key] == undefined || obj[key] == null || obj[key] === "")
                    continue;
                propertyNameList.push("`" + key + "`");
                if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    propertyValueList.push("'" + JSON.stringify(obj[key]) + "'");
                }
                else if (isNaN(obj[key]) || typeof (obj[key]) == "string") {
                    propertyValueList.push("'" + obj[key] + "'");
                }
                else if (obj[key] instanceof Date) {
                    propertyValueList.push("'" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                }
                else {
                    propertyValueList.push(obj[key]);
                }
            }
        }
        return { PropertyNameList: propertyNameList, PropertyValueList: propertyValueList };
    }
    isAvailableValue(value) {
        return typeof (value) == "object" || typeof (value) == "string" || typeof (value) == "number" || typeof (value) == "boolean";
    }
    dateFormat(d, fmt) {
        let o = {
            "M+": d.getMonth() + 1,
            "d+": d.getDate(),
            "H+": d.getHours(),
            "m+": d.getMinutes(),
            "s+": d.getSeconds(),
            "q+": Math.floor((d.getMonth() + 3) / 3),
            "S": d.getMilliseconds()
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}
exports.MysqlDataContext = MysqlDataContext;
//# sourceMappingURL=dataContextMysql.js.map