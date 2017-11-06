import { QueryActionType, IndexedDBDataContext } from './dataContextIndexedDB';
import { EntityObject } from "../entityObject";
import { IEntityObject, IDataContext, IQueryObject } from '../tinyDB';

export class EntityObjectIndexedDB<T extends IEntityObject> extends EntityObject<T> {
    id: string;

    private ctx: IndexedDBDataContext
    constructor(ctx?: IDataContext) {
        super(ctx);
        if (ctx) {
            this.ctx = ctx as IndexedDBDataContext;
        }
    }
    toString(): string { return ""; }

    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[], entity?) {
        this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.Select, qFn);
        return this;
    }
    Any(qFn: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: boolean) => void) {
        return new Promise<boolean>((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.SelectAny, qFn);
            this.ctx.OnSubmit(r => {
                resolve(r);
            });
        });
    }
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void): Promise<number> {
        return new Promise((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.SelectCount, qFn);
            this.ctx.OnSubmit(r => {
                resolve(r);
            });
        });
    }
    OrderBy<T>(qFn: (x: T) => void, entity?: T) { return this; }
    OrderByDesc<T>(qFn: (x: T) => void, entity?: T) { return this; }
    Select(qFn: (x: T) => void) { return this; }
    Take(count: number) {
        this.ctx.AddTakeCount(count);
        return this;
    }
    Skip(count: number) {
        this.ctx.AddSkipCount(count);
        return this;
    }
    Max(qFn: (x: T) => void): Promise<number> { return null; }
    Min(qFn: (x: T) => void): Promise<number> { return null; }
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void) {
        return new Promise<T>((resolve, reject) => {
            this.ctx.AddQueryScratchpad(this.toString(), QueryActionType.SelectFirst, qFn);
            this.ctx.OnSubmit(x => {
                resolve(this.clone(x, <any>this));
            });
        });
    }
    ToList(queryCallback?: (result: T[]) => void): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.ctx.OnSubmit(r => {
                resolve(this.cloneList(r));
            }, this.toString());
        });
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
    /**
     * Obsolete 过时的方法，后期的版本中不再提供次方法。
     * 
     * @param {any[]} list
     * @returns {T[]}
     * 
     * @memberOf EntityObjectIndexedDB
     */
    cloneList(list: any[]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(x, new Object() as T, false));
        });

        return r;
    }
    Join<K extends IEntityObject>(entity: K, qFn: (x: K) => void) {
        return this;
    }
    Contains(feild: (x: T) => void, values: any[]) {
        return this;
    }
}