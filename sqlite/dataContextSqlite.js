"use strict";
const sqlite = require("sqlite-sync");
class SqliteDataContext {
    constructor(dbName) {
        this.dbName = "js/Test.db3";
        this.transactionOn = false;
        this.querySentence = [];
        this.dbName = dbName;
        var r = sqlite.connect(this.dbName);
    }
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
    Delete(obj) {
        let sqlStr = "DELETE FROM " + obj.toString() + " WHERE id=" + obj.id + ";";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    }
    BeginTranscation() {
        this.transactionOn = true;
        this.querySentence.push("BEGIN TRANSACTION;");
    }
    Commit() {
        if (!this.transactionOn)
            return;
        this.querySentence.push("COMMIT;");
        let r = sqlite.run(this.querySentence.join(" "));
        if (r && r.error) {
            sqlite.run("ROLLBACK;");
        }
        this.querySentence = [];
        this.transactionOn = false;
        return r;
    }
    Query(sqlStr) {
        return sqlite.run(sqlStr);
    }
    onSubmit(sqlStr) {
        return sqlite.run(sqlStr);
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
exports.SqliteDataContext = SqliteDataContext;
function Transaction(target, propertyName, descriptor) {
    let method = descriptor.value;
}
exports.Transaction = Transaction;
//# sourceMappingURL=dataContextSqlite.js.map