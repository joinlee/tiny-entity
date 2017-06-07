import { EntityCopier } from "../entityCopier";
import { EntityObject } from '../entityObject';
import { IDataContext, IEntityObject, IQueryObject } from '../tinyDB';

/**
 * EntityObject
 */
export class EntityObjectMysql<T extends IEntityObject> extends EntityObject<T> {
    id: string;
    toString(): string { return ""; }
    private ctx: IDataContext;
    private sqlTemp = [];
    private joinParms: {
        joinSql: string; joinSelectFeild: string; joinTableName: string;
    }[] = [];
    private queryParam: QueryParams = new Object() as QueryParams;
    constructor(ctx?: IDataContext) {
        super(ctx);
        this.ctx = ctx;
    }
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]) {
        this.sqlTemp.push("(" + this.formateCode(qFn, this.toString(), paramsKey, paramsValue) + ")");
        return this;
    }
    Join<K extends IEntityObject>(qFn: (x: K) => void, entity: K, mainFeild?: string) {
        let joinTableName = entity.toString().toLocaleLowerCase();
        let feild = this.formateCode(qFn);
        let mainTableName = this.toString();
        if (this.joinParms && this.joinParms.length > 0) {
            mainTableName = this.joinParms[this.joinParms.length - 1].joinTableName;
        }
        if (mainFeild == null || mainFeild == undefined) mainFeild = "id";
        let sql = "LEFT JOIN `" + joinTableName + "` ON " + mainTableName + "." + mainFeild + " = " + joinTableName + "." + feild;

        this.joinParms.push({
            joinSql: sql,
            joinSelectFeild: this.GetSelectFieldList(entity).join(","),
            joinTableName: joinTableName
        });

        return this;
    }
    private GetSelectFieldList(entity) {
        let tableName = entity.toString().toLocaleLowerCase();
        let feildList = [];
        for (let key in entity) {
            if (
                typeof (key) != "object"
                && typeof (key) != "function"
                && key != "sqlTemp"
                && key != "queryParam"
                && key != "ctx"
                && key != "joinParms"
            )
                feildList.push(tableName + ".`" + key + "` AS " + tableName + "_" + key);
        }
        return feildList;
    }
    Select(qFn: (x: T) => void) {
        let fileds = this.formateCode(qFn);
        this.queryParam.SelectFileds = fileds.split("AND");
        return this;
    }
    async Any(qFn: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: boolean) => void): Promise<boolean> {
        let result = await this.Count(qFn, paramsKey, paramsValue, (queryCallback as any));
        return new Promise<boolean>((resolve, reject) => {
            resolve(result > 0);
        });
    }
    async Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void): Promise<number> {
        let sql = "";
        if (qFn) {
            sql = "SELECT COUNT(id) FROM `" + this.toString() + "` WHERE " + this.formateCode(qFn, null, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT COUNT(id) FROM `" + this.toString() + "`";
        }

        sql = this.addQueryStence(sql) + ";";

        let r = await this.ctx.Query(sql);
        let result = r ? r[0]["COUNT(id)"] : 0;

        return new Promise<number>((resolve, reject) => {
            resolve(result);
        });
    }
    Contains(feild: (x: T) => void, values: any[]) {
        let filed = this.formateCode(feild);
        filed = this.toString() + "." + filed;
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
    async First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void): Promise<T> {
        let sql: string;
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

        let row = await this.ctx.Query(sql);
        let obj;
        if (row && row[0]) {
            obj = row[0];
        }
        if (obj)
            return this.clone(EntityCopier.Decode(obj), new Object() as T);
        else return null;
    }
    Take(count: number) {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number) {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy<K extends IEntityObject>(qFn: (x: K) => void, entity?: K) {
        let tableName = this.toString();
        if (entity) tableName = entity.toString();
        var sql = this.formateCode(qFn, tableName);
        this.queryParam.OrderByFeildName = sql;
        return this;
    }
    OrderByDesc<K extends IEntityObject>(qFn: (x: K) => void, entity?: K) {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn, entity);
    }
    GroupBy(qFn: (x: T) => void) {
        let fileds = this.formateCode(qFn, this.toString());
        this.queryParam.GroupByFeildName = fileds;
        return this;
    }
    private GetFinalQueryFields() {
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
    async ToList<T>(queryCallback?: (result: T[]) => void) {
        let row;
        let queryFields = this.GetFinalQueryFields();
        if (this.sqlTemp.length > 0) {
            let sql = "SELECT " + queryFields + " FROM `" + this.toString() + "` ";
            if (this.joinParms && this.joinParms.length > 0) {
                for (let joinItem of this.joinParms) {
                    sql += joinItem.joinSql + " ";
                }
            }
            sql += "WHERE " + this.sqlTemp.join(' AND '); 0
            sql = this.addQueryStence(sql) + ";";
            row = await this.ctx.Query(sql);
        }
        else {
            let sql = "SELECT " + queryFields + " FROM `" + this.toString() + "` ";
            if (this.joinParms && this.joinParms.length > 0) {
                for (let joinItem of this.joinParms) {
                    sql += joinItem.joinSql + " ";
                }
            }
            sql = this.addQueryStence(sql) + ";";
            row = await this.ctx.Query(sql);
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
                            newRow[objItem] = EntityCopier.Decode(newRow[objItem]);
                    }

                    newRows.push(newRow);
                }
                this.joinParms = [];

                return newRows;
                //return this.cloneList(<any>newRows);
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
    Max(qFn: (x: T) => void): Promise<number> {
        return null;
    }
    Min(qFn: (x: T) => void): Promise<number> {
        return null;
    }

    private getParameterNames(fn) {
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

    private formateCode(qFn, tableName?: string, paramsKey?: string[], paramsValue?: any[]): string {
        let qFnS: string = qFn.toString();
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
        //p是参数
        let p: string = this.getParameterNames(qFn)[0];
        qFnS = qFnS.substring(p.length, qFnS.length);
        qFnS = qFnS.trim();
        if (tableName)
            qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), tableName + ".");
        else
            qFnS = qFnS.replace(new RegExp(p + "\\.", "gm"), "");

        let indexOfFlag = qFnS.indexOf(".IndexOf") > -1;
        qFnS = qFnS.replace(new RegExp("\\.IndexOf", "gm"), " LIKE ");

        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        qFnS = qFnS.replace(/\=\=/g, "=");

        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length) throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (indexOfFlag) {
                    v = "LIKE '%" + paramsValue[i] + "%'";
                    qFnS = qFnS.replace(new RegExp("LIKE " + paramsKey[i], "gm"), v);
                }
                else {
                    let opchar = qFnS[qFnS.lastIndexOf(paramsKey[i]) - 2];
                    if (isNaN(v)) v = opchar + " '" + paramsValue[i] + "'";
                    else v = opchar + " " + paramsValue[i];

                    if (paramsValue[i] == "" || paramsValue[i] == null || paramsValue[i] == undefined) {
                        v = "IS NULL";
                    }
                    qFnS = qFnS.replace(new RegExp(opchar + " " + paramsKey[i], "gm"), v);
                }
            }
        }
        else {
            qFnS = qFnS.replace(new RegExp("= null", "gm"), "IS NULL");
        }
        return qFnS;
    }
    clone(source: any, destination: T, isDeep?: boolean): T {
        if (!source) return null;

        destination = JSON.parse(JSON.stringify(source));
        delete (destination as any).sqlTemp;
        delete (destination as any).queryParam;
        delete (destination as any).joinParms;
        delete (destination as any)._id;
        delete (destination as any).ctx;
        destination.toString = this.toString;
        return destination;
    }
    private cloneList(list: [any]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(EntityCopier.Decode(x), new Object() as T, false));
        });

        return r;
    }
    private addQueryStence(sql: string): string {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.GroupByFeildName) {
            sql += " GROUP BY " + this.queryParam.GroupByFeildName;
        }
        if (this.queryParam.OrderByFeildName) {
            sql += " ORDER BY " + this.queryParam.OrderByFeildName;
            if (this.queryParam.IsDesc) sql += " DESC";
        }
        if (this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) {
            if (this.queryParam.SkipCount == null && this.queryParam.SkipCount == undefined) this.queryParam.SkipCount = 0;
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    private clearQueryParams(): void {
        this.queryParam = new Object() as QueryParams;
    }
}

interface QueryParams {
    TakeCount: number;
    SkipCount: number;
    OrderByFeildName: string;
    IsDesc: boolean;
    SelectFileds: string[];
    GroupByFeildName: string;
}