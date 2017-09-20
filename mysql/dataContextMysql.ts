import mysql = require("mysql");
import { EntityCopier } from "../entityCopier";
import { IDataContext, IEntityObject } from '../tinyDB';
import { Interpreter } from "../interpreter";
var mysqlPool: mysql.Pool;

function log() {
    if (process.env.tinyLog == "on") {
        console.log(arguments);
    }
}
const logger: (...args) => void = log;

export class MysqlDataContext implements IDataContext {
    Delete(obj: IEntityObject);
    Delete<T extends IEntityObject>(obj: IEntityObject, func: (x: T) => boolean);
    Delete<T extends IEntityObject>(obj: IEntityObject, func: (x: T) => boolean, paramsKey: string[], paramsValue: any[]);
    Delete(obj: any, func?: any, paramsKey?: any, paramsValue?: any) {
        let sqlStr: string;
        if (func) {
            let interpreter = new Interpreter(mysql.escape, obj.toString());
            let s = interpreter.TransToSQLOfWhere(func, obj.toString(), paramsKey, paramsValue);
            sqlStr = "DELETE FROM " + obj.toString() + " WHERE " + s + ";";
        }
        else {
            sqlStr = "DELETE FROM " + obj.toString() + " WHERE id='" + obj.id + "';";
        }

        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    private transactionOn: string;
    private querySentence: string[] = [];
    private mysqlPool;

    constructor(option: mysql.PoolOptions) {
        if (!mysqlPool) mysqlPool = mysql.createPool(option);
    }
    /**
     * @param  {IEntityObject} obj
     */
    async Create(obj: IEntityObject) {
        let sqlStr = "INSERT INTO " + obj.toString();
        let pt = this.propertyFormat(obj);

        sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";

        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = await this.onSubmit(sqlStr);
        }
        return EntityCopier.Decode(obj);
    }
    /**
     * @param  {IEntityObject} obj
     */
    async Update(obj: IEntityObject) {
        let sqlStr = "UPDATE " + obj.toString() + " SET ";
        let qList = [];
        for (var key in obj) {
            if (key == "sqlTemp" || key == "queryParam" || key == "ctx" || key == "joinParms") continue;
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

        //todo:判断id的类型
        sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = await this.onSubmit(sqlStr);
        }
        return EntityCopier.Decode(obj);

    }

    private transStatus = [];
    /**
     * 开启一个事务
     */
    BeginTranscation() {
        this.transactionOn = "on";
        this.transStatus.push({ key: new Date().getTime() });
        logger("BeginTranscation", this.transStatus.length);
    }

    /**
     * 提交一个事务
     */
    Commit() {
        if (this.transStatus.length > 1) {
            logger("transaction is pedding!");
            this.transStatus.splice(0, 1);
            return false;
        }
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection(async (err, conn) => {
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
                        let r = await this.TrasnQuery(conn, sql);
                    }
                    conn.commit(err => {
                        if (err) conn.rollback(() => {
                            conn.release();
                            reject(err);
                        });
                        this.CleanTransactionStatus();
                        conn.release();
                        resolve(true);
                        logger("Transcation successful!");
                    });
                } catch (error) {
                    this.CleanTransactionStatus();
                    conn.release();
                    reject(error);
                }
            });
        });
    }

    private CleanTransactionStatus() {
        this.querySentence = [];
        this.transactionOn = null;
        this.transStatus = [];
    }

    private async TrasnQuery(conn: mysql.Connection, sql: string) {
        return new Promise((resolve, reject) => {
            conn.query(sql, (err, result) => {
                if (err) {
                    logger("TrasnQuery , hhhhhhhhhhhhhhhhh", err, sql);
                    conn.rollback(() => { reject(err) });
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    RollBack() {
        this.CleanTransactionStatus();
    }
    /**
     * @param  {string} sqlStr
     */
    Query(sqlStr: string) {
        return this.onSubmit(sqlStr);
    }

    private onSubmit(sqlStr: string) {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => {
                logger(sqlStr);
                if (err) {
                    conn.release();
                    reject(err);
                }
                conn.query(sqlStr, (err, args) => {
                    conn.release();
                    if (err) reject(err);
                    else resolve(args);
                });
            });
        });
    }
    private propertyFormat(obj: IEntityObject): PropertyFormatResult {
        const propertyNameList: string[] = [];
        const propertyValueList = [];
        for (var key in obj) {
            //数组转换
            if (this.isAvailableValue(obj[key])) {
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx" || key == "joinParms") continue;
                if (obj[key] == undefined || obj[key] == null || obj[key] === "") continue;
                propertyNameList.push("`" + key + "`");
                if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    propertyValueList.push(mysql.escape(JSON.stringify(obj[key])));
                } else if (isNaN(obj[key]) || typeof (obj[key]) == "string") {
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

    private isAvailableValue(value): boolean {
        return typeof (value) == "object" || typeof (value) == "string" || typeof (value) == "number" || typeof (value) == "boolean";
    }

    private dateFormat(d: Date, fmt: string) {
        let o = {
            "M+": d.getMonth() + 1, //月份 
            "d+": d.getDate(), //日 
            "H+": d.getHours(), //小时 
            "m+": d.getMinutes(), //分 
            "s+": d.getSeconds(), //秒 
            "q+": Math.floor((d.getMonth() + 3) / 3), //季度 
            "S": d.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}

interface PropertyFormatResult {
    PropertyNameList: string[];
    PropertyValueList: any[];
}


