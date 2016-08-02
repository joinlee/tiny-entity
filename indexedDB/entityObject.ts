///<reference path="typings/tinyDB.d.ts" />
///<reference path="./dataContext.ts" />
import { DataContext, QueryActionType } from './dataContext';

export class EntityObject<T> implements IEntityObject, IQueryObject<T> {
    id: string;

    private ctx: DataContext
    constructor(ctx?: DataContext) {
        if (ctx) {
            this.ctx = ctx;
        }
    }
    toString(): string { return ""; }

    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T> {
        this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.Select, qFn);
        return this;
    }
    Any(qFn: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: boolean) => void) {
        this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.SelectAny, qFn);
        this.ctx.OnSubmit(queryCallback);
    }
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void) {

    }
    OrderBy(qFn: (x: T) => void): IQueryObject<T> { return this; }
    OrderByDesc(qFn: (x: T) => void): IQueryObject<T> { return this; }
    Select(qFn: (x: T) => void): IQueryObject<T> { return this; }
    Take(count: number): IQueryObject<T> { return this; }
    Skip(count: number): IQueryObject<T> { return this; }
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void) {
        this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.SelectFirst, qFn);
        this.ctx.OnSubmit(x => {
            queryCallback(this.clone(x, <any>this));
        });
    }
    ToList(queryCallback?: (result: T[]) => void): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.ctx.OnSubmit(r => {
                resolve(this.cloneList(r));
            }, this.toString());
        });
    }

    clone(source: any, destination: T, isDeep: boolean = false): T {
        if (!source) return null;
        for (var key in source) {
            if (typeof (key) != "function") {
                if (isDeep) { }
                else {
                    if (typeof (key) != "object") {
                        destination[key] = source[key];
                    }
                }
            }
        }
        delete (destination as any).sqlTemp;
        delete (destination as any).queryParam;
        delete (destination as any)._id;
        delete (destination as any).ctx;
        destination.toString = this.toString;
        return destination;
    }
    cloneList(list: any[]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(x, new Object() as T, false));
        });

        return r;
    }
}