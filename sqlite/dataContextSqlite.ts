import { EntityCopier } from './../entityCopier';
import { IEntityObject, IDataContext } from '../tinyDB';
import sqlite = require("sqlite-sync");

export class SqliteDataContext implements IDataContext {
    private dbName: string = "js/Test.db3";
    private transactionOn: boolean = false;
    private querySentence: string[] = [];

    constructor(dbName?: string) {
        this.dbName = dbName;
        var r = sqlite.connect(this.dbName);

        // let x = this.Query("select * from sqlite_master where type='table';");
        // console.log(x);
    }
    /**
     * @param  {IEntityObject} obj
     */
    Create(obj: IEntityObject) {
        let sqlStr = "INSERT INTO " + obj.toString();
        let pt = this.propertyFormat(obj);

        sqlStr += " (" + pt.PropertyNameList.join(',') + ") VALUES (" + pt.PropertyValueList.join(',') + ");";

        console.log(sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = this.onSubmit(sqlStr);
            return EntityCopier.Decode(obj);
        }
    }
    /**
     * @param  {IEntityObject} obj      
     */
    Update(obj: IEntityObject) {
        let sqlStr = "UPDATE " + obj.toString() + " SET ";
        let qList = [];
        for (var key in obj) {
            if (this.isAvailableValue(obj[key]) && key != "id") {
                if (obj[key] == undefined || obj[key] == null || obj[key] == "") continue;
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx") continue;
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

        //todo:判断id的类型
        sqlStr += qList.join(',') + " WHERE id='" + obj.id + "';";
        console.log("Update:", sqlStr);
        if (this.transactionOn) {
            this.querySentence.push(sqlStr);
        }
        else {
            let r = this.onSubmit(sqlStr);
            return EntityCopier.Decode(obj);
        }

    }
    /**
     * @param  {IEntityObject} obj
     */
    Delete(obj: IEntityObject) {
        let sqlStr = "DELETE FROM " + obj.toString() + " WHERE id=" + obj.id + ";";
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
        this.querySentence.push("BEGIN TRANSACTION;");
    }

    /**
     * 提交一个事务
     */
    Commit() {
        if (!this.transactionOn) return;
        this.querySentence.push("COMMIT;");
        let r = sqlite.run(this.querySentence.join(" "));
        if (r && r.error) {
            sqlite.run("ROLLBACK;");
        }
        this.querySentence = [];
        this.transactionOn = false;
        return r;
    }
    /**
     * @param  {string} sqlStr
     */
    Query(sqlStr: string) {
        return sqlite.run(sqlStr);
    }

    RollBack() { }

    private onSubmit(sqlStr: string): any {
        return sqlite.run(sqlStr);
    }
    private propertyFormat(obj: IEntityObject): PropertyFormatResult {
        const propertyNameList: string[] = [];
        const propertyValueList = [];
        for (var key in obj) {
            //数组转换
            if (this.isAvailableValue(obj[key])) {
                if (obj[key] == null || obj[key] == undefined || obj[key] == "") continue;
                if (key == "sqlTemp" || key == "queryParam" || key == "ctx") continue;
                propertyNameList.push(key);
                if (Array.isArray(obj[key]) || Object.prototype.toString.call(obj[key]) === '[object Object]') {
                    propertyValueList.push("'" + JSON.stringify(obj[key]) + "'");
                } else if (isNaN(obj[key])) {
                    propertyValueList.push("'" + obj[key] + "'");
                }
                else if (obj[key] instanceof Date) {
                    propertyValueList.push("'" + this.dateFormat(obj[key], "yyyy-MM-dd HH:mm:ss") + "'");
                }
                else {
                    if (obj[key] === true) {
                        obj[key] = 1;
                    }
                    else if (obj[key] === false) {
                        obj[key] = 0;
                    }
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

