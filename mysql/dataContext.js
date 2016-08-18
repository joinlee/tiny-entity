"use strict";
const mysql = require("mysql");
class DataContext {
    constructor(option) {
        this.transactionOn = false;
        this.querySentence = [];
        this.mysqlPool = mysql.createPool(option);
    }
    /**
     * @param  {IEntityObject} obj
     */
    Create(obj) {
        let sqlStr = "INSERT INTO " + obj.toString();
        let pt = this.propertyFormat(obj);
        sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";
        console.log(sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    /**
     * @param  {IEntityObject} obj
     */
    Update(obj) {
        let sqlStr = "UPDATE " + obj.toString() + " SET ";
        let qList = [];
        for (var key in obj) {
            if (this.isNotObjectOrFunction(obj[key]) && key != "Id") {
                if (isNaN(obj[key])) {
                    qList.push(key + "='" + obj[key] + "'");
                }
                else if (obj[key] instanceof Date) {
                    qList.push(key + "='" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                }
                else {
                    qList.push(key + "=" + obj[key]);
                }
            }
        }
        sqlStr += qList.join(',') + " WHERE id=" + obj.id + ";";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    /**
     * @param  {IEntityObject} obj
     */
    Delete(obj) {
        let sqlStr = "DELETE FROM " + obj.toString() + " WHERE id=" + obj.id + ";";
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
        if (!this.transactionOn)
            return;
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, conn) => {
                console.log("mysql Commit error:", err);
                if (err)
                    reject(err);
                conn.beginTransaction(err => {
                    if (err)
                        reject(err);
                });
                conn.query(this.querySentence.join(" "), (err, ...args) => {
                    if (err) {
                        conn.rollback(() => { reject(err); });
                    }
                    else {
                        conn.commit(err => {
                            if (err)
                                conn.rollback(() => { reject(err); });
                            this.querySentence = [];
                            this.transactionOn = false;
                            resolve(args);
                        });
                    }
                });
            });
        });
    }
    /**
     * @param  {string} sqlStr
     */
    Query(sqlStr) {
        console.log(sqlStr);
        return this.onSubmit(sqlStr);
    }
    onSubmit(sqlStr) {
        return new Promise((resolve, reject) => {
            this.mysqlPool.getConnection((err, conn) => {
                console.log("mysql onSubmits error:", err);
                if (err)
                    reject(err);
                conn.query(sqlStr, (err, ...args) => {
                    if (err)
                        reject(err);
                    else
                        resolve(args);
                });
            });
        });
    }
    propertyFormat(obj) {
        let propertyNameList = [];
        let propertyValueList = [];
        for (var key in obj) {
            if (this.isNotObjectOrFunction(obj[key])) {
                propertyNameList.push(key);
                if (isNaN(obj[key])) {
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
    isNotObjectOrFunction(value) {
        if (value instanceof Date)
            return true;
        return typeof (value) != "object" && typeof (value) != "function" && value != "undefine" && value != null;
    }
    dateFormat(d, fmt) {
        let o = {
            "M+": d.getMonth() + 1,
            "d+": d.getDate(),
            "H+": d.getHours(),
            "m+": d.getMinutes(),
            "s+": d.getSeconds(),
            "q+": Math.floor((d.getMonth() + 3) / 3),
            "S": d.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}
exports.DataContext = DataContext;
//# sourceMappingURL=dataContext.js.map