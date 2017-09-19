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
const entityCopier_1 = require("../entityCopier");
const entityObject_1 = require("../entityObject");
const mysql = require("mysql");
const interpreter_1 = require("../interpreter");
class EntityObjectMysql extends entityObject_1.EntityObject {
    constructor(ctx) {
        super(ctx);
        this.sqlTemp = [];
        this.joinParms = [];
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        this.sqlTemp.push("(" + interpreter.TransToSQLOfWhere(qFn, this.toString(), paramsKey, paramsValue) + ")");
        return this;
    }
    Join(qFn, entity, mainFeild, isMainTable) {
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        let joinTableName = entity.toString().toLocaleLowerCase();
        let feild = interpreter.TransToSQLOfWhere(qFn);
        let mainTableName = this.toString();
        if (this.joinParms.length > 0 && !isMainTable) {
            mainTableName = this.joinParms[this.joinParms.length - 1].joinTableName;
        }
        if (mainFeild == null || mainFeild == undefined)
            mainFeild = "id";
        let sql = "LEFT JOIN `" + joinTableName + "` ON `" + mainTableName + "`." + mainFeild + " = `" + joinTableName + "`.`" + feild + "`";
        this.joinParms.push({
            joinSql: sql,
            joinSelectFeild: this.GetSelectFieldList(entity).join(","),
            joinTableName: joinTableName
        });
        return this;
    }
    LeftJoin(func) {
    }
    On() {
    }
    GetSelectFieldList(entity) {
        let tableName = entity.toString().toLocaleLowerCase();
        let feildList = [];
        for (let key in entity) {
            if (typeof (key) != "object"
                && typeof (key) != "function"
                && key != "sqlTemp"
                && key != "queryParam"
                && key != "ctx"
                && key != "joinParms")
                feildList.push(tableName + ".`" + key + "` AS " + tableName + "_" + key);
        }
        return feildList;
    }
    Select(qFn) {
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        let fileds = interpreter.TransToSQLOfSelect(qFn);
        this.queryParam.SelectFileds = fileds.split(",");
        return this;
    }
    Any(qFn, paramsKey, paramsValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.Count(qFn, paramsKey, paramsValue);
            return new Promise((resolve, reject) => {
                resolve(result > 0);
            });
        });
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = "";
            if (qFn) {
                let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
                sql = "SELECT COUNT(id) FROM `" + this.toString() + "` WHERE " + interpreter.TransToSQLOfWhere(qFn, null, paramsKey, paramsValue);
            }
            else {
                sql = "SELECT COUNT(id) FROM `" + this.toString() + "`";
            }
            sql = this.addQueryStence(sql) + ";";
            let r = yield this.ctx.Query(sql);
            let result = r ? r[0]["COUNT(id)"] : 0;
            return new Promise((resolve, reject) => {
                resolve(result);
            });
        });
    }
    Contains(feild, values) {
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        let filed = interpreter.TransToSQLOfWhere(feild);
        filed = this.toString() + "." + filed;
        let arr = values.slice();
        if (arr && arr.length > 0) {
            let sql = "";
            if (isNaN(arr[0])) {
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = "'" + arr[i] + "'";
                }
            }
            sql = filed + " IN (" + arr.join(",") + ")";
            this.sqlTemp.push("(" + sql + ")");
            return this;
        }
    }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql;
            let queryFields = this.GetFinalQueryFields();
            if (qFn) {
                let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
                sql = "SELECT * FROM `" + this.toString() + "` WHERE " + interpreter.TransToSQLOfWhere(qFn, null, paramsKey, paramsValue);
            }
            else {
                sql = "SELECT * FROM `" + this.toString() + "`";
            }
            this.Skip(0);
            this.Take(1);
            sql = this.addQueryStence(sql) + ";";
            let row = yield this.ctx.Query(sql);
            let obj;
            if (row && row[0]) {
                obj = row[0];
            }
            if (obj)
                return this.clone(entityCopier_1.EntityCopier.Decode(obj), new Object());
            else
                return null;
        });
    }
    Take(count) {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count) {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn, entity) {
        let tableName = this.toString();
        if (entity)
            tableName = entity.toString();
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        var sql = interpreter.TransToSQLOfWhere(qFn, tableName);
        this.queryParam.OrderByFeildName = sql;
        return this;
    }
    OrderByDesc(qFn, entity) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn, entity);
    }
    GroupBy(qFn) {
        let interpreter = new interpreter_1.Interpreter(mysql.escape, this.toString());
        let fileds = interpreter.TransToSQLOfWhere(qFn);
        this.queryParam.GroupByFeildName = fileds;
        return this;
    }
    GetFinalQueryFields() {
        let feilds = "*";
        if (this.joinParms && this.joinParms.length > 0) {
            let wfs = this.GetSelectFieldList(this).join(",");
            feilds = wfs;
            for (let joinSelectFeild of this.joinParms) {
                feilds += ("," + joinSelectFeild.joinSelectFeild);
            }
        }
        return feilds;
    }
    ToList(queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let row;
            let queryFields = this.GetFinalQueryFields();
            try {
                if (this.sqlTemp.length > 0) {
                    let sql = "SELECT " + queryFields + " FROM `" + this.toString() + "` ";
                    if (this.joinParms && this.joinParms.length > 0) {
                        for (let joinItem of this.joinParms) {
                            sql += joinItem.joinSql + " ";
                        }
                    }
                    sql += "WHERE " + this.sqlTemp.join(' AND ');
                    0;
                    sql = this.addQueryStence(sql) + ";";
                    row = yield this.ctx.Query(sql);
                }
                else {
                    let sql = "SELECT " + queryFields + " FROM `" + this.toString() + "` ";
                    if (this.joinParms && this.joinParms.length > 0) {
                        for (let joinItem of this.joinParms) {
                            sql += joinItem.joinSql + " ";
                        }
                    }
                    sql = this.addQueryStence(sql) + ";";
                    row = yield this.ctx.Query(sql);
                }
                this.sqlTemp = [];
                if (row[0]) {
                    if (this.joinParms && this.joinParms.length > 0) {
                        let newRows = [];
                        for (let rowItem of row) {
                            let newRow = {};
                            for (let feild in rowItem) {
                                let s = feild.split("_");
                                newRow[s[0]] || (newRow[s[0]] = {
                                    toString: function () { return s[0]; }
                                });
                                if (rowItem[s[0] + "_id"] == null) {
                                    newRow[s[0]] = null;
                                    break;
                                }
                                else {
                                    newRow[s[0]][s[1]] = rowItem[feild];
                                }
                            }
                            for (let objItem in newRow) {
                                if (newRow[objItem] != null)
                                    newRow[objItem] = entityCopier_1.EntityCopier.Decode(newRow[objItem]);
                            }
                            newRows.push(newRow);
                        }
                        this.joinParms = [];
                        return newRows;
                    }
                    else {
                        return this.cloneList(row);
                    }
                }
                else {
                    this.joinParms = [];
                    return [];
                }
            }
            catch (error) {
                throw error;
            }
            finally {
                this.joinParms = [];
                this.sqlTemp = [];
            }
        });
    }
    Max(qFn) {
        return null;
    }
    Min(qFn) {
        return null;
    }
    clone(source, destination, isDeep) {
        if (!source)
            return null;
        destination = JSON.parse(JSON.stringify(source));
        delete destination.sqlTemp;
        delete destination.queryParam;
        delete destination.joinParms;
        delete destination._id;
        delete destination.ctx;
        destination.toString = this.toString;
        return destination;
    }
    cloneList(list) {
        let r = [];
        list.forEach(x => {
            if (x)
                r.push(this.clone(entityCopier_1.EntityCopier.Decode(x), new Object(), false));
        });
        return r;
    }
    addQueryStence(sql) {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.GroupByFeildName) {
            sql += " GROUP BY " + this.queryParam.GroupByFeildName;
        }
        if (this.queryParam.OrderByFeildName) {
            sql += " ORDER BY " + this.queryParam.OrderByFeildName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if (this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) {
            if (this.queryParam.SkipCount == null && this.queryParam.SkipCount == undefined)
                this.queryParam.SkipCount = 0;
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    clearQueryParams() {
        this.queryParam = new Object();
    }
}
exports.EntityObjectMysql = EntityObjectMysql;
//# sourceMappingURL=entityObjectMysql.js.map