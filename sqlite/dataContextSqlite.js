"use strict";
var sqlite = require("sqlite-sync");
var SqliteDataContext = (function () {
    function SqliteDataContext(dbName) {
        this.dbName = "js/Test.db3";
        this.transactionOn = false;
        this.querySentence = [];
        this.dbName = dbName;
        var r = sqlite.connect(this.dbName);
    }
    SqliteDataContext.prototype.Create = function (obj) {
        var sqlStr = "INSERT INTO " + obj.toString();
        var pt = this.propertyFormat(obj);
        sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";
        console.log(sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    };
    SqliteDataContext.prototype.Update = function (obj) {
        var sqlStr = "UPDATE " + obj.toString() + " SET ";
        var qList = [];
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
    };
    SqliteDataContext.prototype.Delete = function (obj) {
        var sqlStr = "DELETE FROM " + obj.toString() + " WHERE id=" + obj.id + ";";
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            return this.onSubmit(sqlStr);
        }
    };
    SqliteDataContext.prototype.BeginTranscation = function () {
        this.transactionOn = true;
        this.querySentence.push("BEGIN TRANSACTION;");
    };
    SqliteDataContext.prototype.Commit = function () {
        if (!this.transactionOn)
            return;
        this.querySentence.push("COMMIT;");
        var r = sqlite.run(this.querySentence.join(" "));
        if (r && r.error) {
            sqlite.run("ROLLBACK;");
        }
        this.querySentence = [];
        this.transactionOn = false;
        return r;
    };
    SqliteDataContext.prototype.Query = function (sqlStr) {
        return sqlite.run(sqlStr);
    };
    SqliteDataContext.prototype.RollBack = function () { };
    SqliteDataContext.prototype.onSubmit = function (sqlStr) {
        return sqlite.run(sqlStr);
    };
    SqliteDataContext.prototype.propertyFormat = function (obj) {
        var propertyNameList = [];
        var propertyValueList = [];
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
    };
    SqliteDataContext.prototype.isNotObjectOrFunction = function (value) {
        if (value instanceof Date)
            return true;
        return typeof (value) != "object" && typeof (value) != "function" && value != "undefine" && value != null;
    };
    SqliteDataContext.prototype.dateFormat = function (d, fmt) {
        var o = {
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
    };
    return SqliteDataContext;
}());
exports.SqliteDataContext = SqliteDataContext;
//# sourceMappingURL=dataContextSqlite.js.map