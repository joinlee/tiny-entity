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
        this.sqlTemp.push("(" + this.formateCode(qFn, this.toString(), paramsKey, paramsValue) + ")");
        return this;
    }
    Join(qFn, entity, mainFeild, isMainTable) {
        let joinTableName = entity.toString().toLocaleLowerCase();
        let feild = this.formateCode(qFn);
        let mainTableName = this.toString();
        if (this.joinParms.length > 0 && !isMainTable) {
            mainTableName = this.joinParms[this.joinParms.length - 1].joinTableName;
        }
        if (mainFeild == null || mainFeild == undefined)
            mainFeild = "id";
        let sql = "LEFT JOIN `" + joinTableName + "` ON " + mainTableName + "." + mainFeild + " = " + joinTableName + "." + feild;
        this.joinParms.push({
            joinSql: sql,
            joinSelectFeild: this.GetSelectFieldList(entity).join(","),
            joinTableName: joinTableName
        });
        return this;
    }
    LeftJoin(entity) {
        let joinTableName = entity.toString().toLocaleLowerCase();
        this.joinParms.push({
            joinSql: null,
            joinSelectFeild: null,
            joinTableName: joinTableName
        });
        return this;
    }
    On(func) {
        let funcStr = func.toString();
        let funcCharList = funcStr.split("");
        let joinParmsItem = this.joinParms.find(x => x.joinSql == null && x.joinSelectFeild == null);
        let joinTableName = joinParmsItem.joinTableName;
        let mainTableName = this.toString();
        return this;
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
        let fileds = this.formateCode(qFn);
        this.queryParam.SelectFileds = fileds.split("AND");
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.Count(qFn, paramsKey, paramsValue, queryCallback);
            return new Promise((resolve, reject) => {
                resolve(result > 0);
            });
        });
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = "";
            if (qFn) {
                sql = "SELECT COUNT(id) FROM `" + this.toString() + "` WHERE " + this.formateCode(qFn, null, paramsKey, paramsValue);
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
        let filed = this.formateCode(feild);
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
                sql = "SELECT * FROM `" + this.toString() + "` WHERE " + this.formateCode(qFn, null, paramsKey, paramsValue);
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
        var sql = this.formateCode(qFn, tableName);
        this.queryParam.OrderByFeildName = sql;
        return this;
    }
    OrderByDesc(qFn, entity) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn, entity);
    }
    GroupBy(qFn) {
        let fileds = this.formateCode(qFn, this.toString());
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
    getParameterNames(fn) {
        const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const DEFAULT_PARAMS = /=[^,]+/mg;
        const FAT_ARROWS = /=>.*$/mg;
        const code = fn.toString()
            .replace(COMMENTS, '')
            .replace(FAT_ARROWS, '')
            .replace(DEFAULT_PARAMS, '');
        const result = code.slice(code.indexOf('(') + 1, code.indexOf(')') == -1 ? code.length : code.indexOf(')')).match(/([^\s,]+)/g);
        return result === null ? [] : result;
    }
    formateCode(qFn, tableName, paramsKey, paramsValue) {
        let qFnS = qFn.toString();
        qFnS = qFnS.replace(/function/g, "");
        qFnS = qFnS.replace(/return/g, "");
        qFnS = qFnS.replace(/if/g, "");
        qFnS = qFnS.replace(/else/g, "");
        qFnS = qFnS.replace(/true/g, "");
        qFnS = qFnS.replace(/false/g, "");
        qFnS = qFnS.replace(/\{/g, "");
        qFnS = qFnS.replace(/\}/g, "");
        qFnS = qFnS.replace(/\(/g, "");
        qFnS = qFnS.replace(/\)/g, "");
        qFnS = qFnS.replace(/\;/g, "");
        qFnS = qFnS.replace(/=>/g, "");
        qFnS = qFnS.trim();
        let p = this.getParameterNames(qFn)[0];
        qFnS = qFnS.substring(p.length, qFnS.length);
        qFnS = qFnS.trim();
        if (tableName)
            qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "`" + tableName + "`.");
        else
            qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "");
        let indexOfFlag = qFnS.indexOf(".IndexOf") > -1;
        qFnS = qFnS.replace(new RegExp("\\.IndexOf", "gm"), " LIKE ");
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        qFnS = qFnS.replace(/\=\=/g, "=");
        if (paramsKey && paramsValue) {
            qFnS = qFnS.replace(new RegExp("= null", "gm"), "IS NULL");
            if (paramsKey.length != paramsValue.length)
                throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (indexOfFlag) {
                    let xx = mysql.escape(paramsValue[i]);
                    xx = xx.substring(1, xx.length - 1);
                    v = "LIKE '%" + xx + "%'";
                    qFnS = qFnS.replace(new RegExp("LIKE " + paramsKey[i], "gm"), v);
                }
                else {
                    let opchar = qFnS[qFnS.lastIndexOf(paramsKey[i]) - 2];
                    if (isNaN(v))
                        v = opchar + " " + mysql.escape(paramsValue[i]);
                    else
                        v = opchar + " " + mysql.escape(paramsValue[i]);
                    if (paramsValue[i] === "" || paramsValue[i] === null || paramsValue[i] === undefined) {
                        v = "IS NULL";
                    }
                    qFnS = qFnS.replace(new RegExp(opchar + " " + paramsKey[i], "gm"), v);
                }
            }
        }
        else {
            qFnS = qFnS.replace(new RegExp("= null", "gm"), "IS NULL");
            if (indexOfFlag) {
                let s = qFnS.split(" ");
                let sIndex = s.findIndex(x => x === "LIKE");
                if (sIndex) {
                    let sStr = s[sIndex + 1];
                    sStr = sStr.substring(1, sStr.length - 1);
                    sStr = mysql.escape(sStr);
                    sStr = sStr.substring(1, sStr.length - 1);
                    s[sIndex + 1] = "'%" + sStr + "%'";
                    qFnS = s.join(' ');
                }
            }
        }
        return qFnS;
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