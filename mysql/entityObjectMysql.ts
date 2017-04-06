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
    private queryParam: QueryParams = new Object() as QueryParams;
    constructor(ctx?: IDataContext) {
        super(ctx);
        this.ctx = ctx;
    }
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T> {
        this.sqlTemp.push("(" + this.formateCode(qFn, paramsKey, paramsValue) + ")");
        return this;
    }
    Select(qFn: (x: T) => void): IQueryObject<T> {
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
            sql = "SELECT COUNT(id) FROM `" + this.toString() + "` WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
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
        if (qFn) {
            sql = "SELECT * FROM `" + this.toString() + "` WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
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
    Take(count: number): IQueryObject<T> {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number): IQueryObject<T> {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn: (x: T) => void): IQueryObject<T> {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    }
    OrderByDesc(qFn: (x: T) => void): IQueryObject<T> {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    }
    async ToList(queryCallback?: (result: T[]) => void) {
        let row;
        if (this.sqlTemp.length > 0) {
            let sql = "SELECT * FROM `" + this.toString() + "` WHERE " + this.sqlTemp.join(' && ');
            sql = this.addQueryStence(sql) + ";";
            row = await this.ctx.Query(sql);
        }
        else {
            let sql = "SELECT * FROM `" + this.toString() + "`";
            sql = this.addQueryStence(sql) + ";";
            row = await this.ctx.Query(sql);
        }
        this.sqlTemp = [];
        if (row[0])
            return this.cloneList(row);
        else return [];
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

    private formateCode(qFn, paramsKey?: string[], paramsValue?: any[]): string {

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
        //p是参数
        let p: string = this.getParameterNames(qFn)[0];
        qFnS = qFnS.substring(p.length, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p + ".", "gm"), "");
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");
        qFnS = qFnS.replace(/\=\=/g, "=");

        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length) throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (isNaN(v)) v = "= '" + paramsValue[i] + "'";
                else v = "= " + paramsValue[i];

                if (paramsValue[i] == "" || paramsValue[i] == null || paramsValue[i] == undefined) {
                    v = "IS NULL";
                }
                qFnS = qFnS.replace(new RegExp("= " + paramsKey[i], "gm"), v);
            }
        }

        return qFnS;
    }
    clone(source: any, destination: T, isDeep?: boolean): T {
        if (!source) return null;

        destination = JSON.parse(JSON.stringify(source));
        delete (destination as any).sqlTemp;
        delete (destination as any).queryParam;
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
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDER BY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc) sql += " DESC";
        }
        if ((this.queryParam.TakeCount != null && this.queryParam.TakeCount != undefined) && (this.queryParam.SkipCount != null && this.queryParam.SkipCount != undefined)) {
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
    OrderByFiledName: string;
    IsDesc: boolean;
    SelectFileds: string[];
}