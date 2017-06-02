"use strict";
class EntityObject {
    constructor(ctx) { }
    toString() { return ""; }
    clone(source, destination, isDeep) { return null; }
    Where(qFn, paramsKey, paramsValue) { return this; }
    Join(qFn, entity, mainFeild) { return this; }
    Any(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    First(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    ToList(queryCallback) { return null; }
    Count(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    OrderBy(qFn, entity) { return this; }
    OrderByDesc(qFn, entity) { return this; }
    GroupBy(qFn) { return this; }
    Select(qFn) { return this; }
    Take(count) { return this; }
    Skip(count) { return this; }
    Max(qFn) { return null; }
    Min(qFn) { return null; }
    Contains(feild, values) { return this; }
}
exports.EntityObject = EntityObject;
//# sourceMappingURL=entityObject.js.map