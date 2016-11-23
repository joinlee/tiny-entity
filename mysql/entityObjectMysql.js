"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const entityCopier_1 = require("../entityCopier");
const entityObject_1 = require("../entityObject");
class EntityObjectMysql extends entityObject_1.EntityObject {
    constructor(ctx) {
        super(ctx);
        this.sqlTemp = [];
        this.queryParam = new Object();
        this.ctx = ctx;
    }
    toString() { return ""; }
    Where(qFn, paramsKey, paramsValue) {
        this.sqlTemp.push("(" + this.formateCode(qFn, paramsKey, paramsValue) + ")");
        return this;
    }
    Select(qFn) {
        let fileds = this.formateCode(qFn);
        this.queryParam.SelectFileds = fileds.split("AND");
        return this;
    }
    Any(qFn, paramsKey, paramsValue, queryCallback) {
        let result = this.Count(qFn, paramsKey, paramsValue, queryCallback);
        return result > 0;
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) {
        let sql = "";
        if (qFn) {
            sql = "SELECT COUNT(id) FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT COUNT(id) FROM " + this.toString();
        }
        sql = this.addQueryStence(sql) + ";";
        let r = this.ctx.Query(sql);
        let result = r ? r[0]["COUNT(id)"] : 0;
        return result;
    }
    Contains(feild, values) {
        let filed = this.formateCode(feild);
        if (values && values.length > 0) {
            let sql = "";
            if (isNaN(values[0])) {
                for (let i = 0; i < values.length; i++) {
                    values[i] = "'" + values[i] + "'";
                }
            }
            sql = filed + " IN (" + values.join(",") + ")";
            this.sqlTemp.push("(" + sql + ")");
            return this;
        }
    }
    First(qFn, paramsKey, paramsValue, queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql;
            if (qFn) {
                sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
            }
            else {
                sql = "SELECT * FROM " + this.toString();
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
    OrderBy(qFn) {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    }
    OrderByDesc(qFn) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    }
    ToList(queryCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let row;
            if (this.sqlTemp.length > 0) {
                let sql = "SELECT * FROM " + this.toString() + " WHERE " + this.sqlTemp.join(' && ');
                sql = this.addQueryStence(sql) + ";";
                row = yield this.ctx.Query(sql);
            }
            else {
                let sql = "SELECT * FROM " + this.toString();
                sql = this.addQueryStence(sql) + ";";
                row = yield this.ctx.Query(sql);
            }
            this.sqlTemp = [];
            if (row[0])
                return this.cloneList(row);
            else
                return [];
        });
    }
    Max(qFn) {
    }
    Min(qFn) {
    }
    formateCode(qFn, paramsKey, paramsValue) {
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
        let p = qFnS[0];
        qFnS = qFnS.substring(1, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p, "gm"), this.toString());
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        qFnS = qFnS.replace(/\=\=/g, "=");
        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length)
                throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (isNaN(v))
                    v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
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
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDERBY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc)
                sql += " DESC";
        }
        if ((this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) && (this.queryParam.SkipCount != null && this.queryParam.SkipCount != undefined)) {
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