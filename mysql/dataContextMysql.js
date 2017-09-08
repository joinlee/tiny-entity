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
function log() {
    if (process.env.tinyLog == "on") {
        console.log(arguments);
    }
}
const logger = log;
class MysqlDataContext {
    constructor(option) {
        this.querySentence = [];
        this.transStatus = [];
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
            }
            return entityCopier_1.EntityCopier.Decode(obj);
        });
    }
    Update(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            let sqlStr = "UPDATE " + obj.toString() + " SET ";
            let qList = [];
            for (var key in obj) {
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx" || key == "joinParms")
                    continue;
                if (this.isAvailableValue(obj[key]) && key != "id") {
                    if (obj[key] == undefined || obj[key] == null || obj[key] === "") {
                        qList.push("`" + key + "`=NULL");
                    }
                    else if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                        qList.push("`" + key + "`=" + mysql.escape(JSON.stringify(obj[key])));
                    }
                    else if (isNaN(obj[key]) || typeof (obj[key]) == "string") {
                        qList.push("`" + key + "`=" + mysql.escape(obj[key]));
                    }
                    else if (obj[key] instanceof Date) {
                        qList.push("`" + key + "`=" + mysql.escape(this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss")));
                    }
                    else {
                        qList.push("`" + key + "`=" + mysql.escape(obj[key]));
                    }
                }
            }
            sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
            if (this.transactionOn) {
                this.querySentence.push(sqlStr);
            }
            else {
                let r = yield this.onSubmit(sqlStr);
            }
            return entityCopier_1.EntityCopier.Decode(obj);
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
        this.transactionOn = "on";
        this.transStatus.push({ key: new Date().getTime() });
        logger("BeginTranscation", this.transStatus.length);
    }
    Commit() {
        if (this.transStatus.length > 1) {
            logger("transaction is pedding!");
            this.transStatus.splice(0, 1);
            return false;
        }
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
                        logger(sql);
                        let r = yield this.TrasnQuery(conn, sql);
                    }
                    conn.commit(err => {
                        if (err)
                            conn.rollback(() => {
                                conn.release();
                                reject(err);
                            });
                        this.CleanTransactionStatus();
                        conn.release();
                        resolve(true);
                        logger("Transcation successful!");
                    });
                }
                catch (error) {
                    this.CleanTransactionStatus();
                    conn.release();
                    reject(error);
                }
            }));
        });
    }
    CleanTransactionStatus() {
        this.querySentence = [];
        this.transactionOn = null;
        this.transStatus = [];
    }
    TrasnQuery(conn, sql) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                conn.query(sql, (err, result) => {
                    if (err) {
                        logger("TrasnQuery , hhhhhhhhhhhhhhhhh", err, sql);
                        conn.rollback(() => { reject(err); });
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
    RollBack() {
        this.CleanTransactionStatus();
    }
    Query(sqlStr) {
        return this.onSubmit(sqlStr);
    }
    onSubmit(sqlStr) {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => {
                logger(sqlStr);
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
                    propertyValueList.push(mysql.escape(JSON.stringify(obj[key])));
                }
                else if (isNaN(obj[key]) || typeof (obj[key]) == "string") {
                    propertyValueList.push(mysql.escape(obj[key]));
                }
                else if (obj[key] instanceof Date) {
                    propertyValueList.push(mysql.escape(this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss")));
                }
                else {
                    propertyValueList.push(mysql.escape(obj[key]));
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