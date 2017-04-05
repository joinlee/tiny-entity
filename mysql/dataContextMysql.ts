import mysql = require("mysql");
import { EntityCopier } from "../entityCopier";
import { IDataContext, IEntityObject } from '../tinyDB';

var mysqlPool;

export class MysqlDataContext implements IDataContext {
    private transactionOn: boolean = false;
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

        console.log(sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = await this.onSubmit(sqlStr);
            return EntityCopier.Decode(obj);
        }
    }
    /**
     * @param  {IEntityObject} obj
     */
    async Update(obj: IEntityObject) {
        let sqlStr = "UPDATE " + obj.toString() + " SET ";
        let qList = [];
        for (var key in obj) {
            if (this.isAvailableValue(obj[key]) && key != "id") {
                if (obj[key] == undefined || obj[key] == null || obj[key] == "") {
                    qList.push("`" + key + "`=NULL");
                }
                else if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    qList.push("`" + key + "`='" + JSON.stringify(obj[key]) + "'");
                }
                else if (isNaN(obj[key])) {
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

        //todo:判断id的类型
        sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
        console.log("Update:", sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = await this.onSubmit(sqlStr);
            return EntityCopier.Decode(obj);
        }

    }
    /**
     * @param  {IEntityObject} obj
     */
    Delete(obj: IEntityObject) {
        let sqlStr = "DELETE FROM " + obj.toString() + " WHERE id='" + obj.id + "';";
        console.log("DELETE:", sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    /**
     * 开启一个事务
     */
    BeginTranscation() {
        this.transactionOn = true;
    }

    /**
     * 提交一个事务
     */
    Commit() {
        if (!this.transactionOn) return;
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
                for (let sql of this.querySentence) {
                    let r = await this.TrasnQuery(conn, sql);
                }
                conn.commit(err => {
                    if (err) conn.rollback(() => {
                        conn.release();
                        reject(err);
                    });
                    this.querySentence = [];
                    this.transactionOn = false;
                    conn.release();
                    resolve(true);
                });
            });
        });
    }

    private async TrasnQuery(conn: mysql.Connection, sql: string) {
        return new Promise((resolve, reject) => {
            conn.query(sql, (err, result) => {
                if (err) {
                    conn.rollback(() => { reject(err) });
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    RollBack() { }
    /**
     * @param  {string} sqlStr
     */
    Query(sqlStr: string) {
        console.log(sqlStr);
        return this.onSubmit(sqlStr);
    }

    private onSubmit(sqlStr: string) {
        return new Promise((resolve, reject) => {
            mysqlPool.getConnection((err, conn) => {
                console.log("mysql onSubmits error:", err);
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
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx") continue;
                if (obj[key] == undefined || obj[key] == null || obj[key] == "") continue;
                propertyNameList.push("`" + key + "`");
                if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    propertyValueList.push("'" + JSON.stringify(obj[key]) + "'");
                } else if (isNaN(obj[key])) {
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

    private isAvailableValue(value): boolean {
        if (value == null || value == undefined) return false;
        return typeof (value) == "object" || typeof (value) == "string" || typeof (value) == "number";
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


