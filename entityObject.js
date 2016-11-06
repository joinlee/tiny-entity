"use strict";
class EntityObject {
    constructor(ctx) {
    }
    toString() { return ""; }
    clone(source, destination, isDeep) { }
    Where(qFn, paramsKey, paramsValue) { return this; }
    Any(qFn, paramsKey, paramsValue, queryCallback) { }
    First(qFn, paramsKey, paramsValue, queryCallback) { return null; }
    ToList(queryCallback) {
        return null;
    }
    Count(qFn, paramsKey, paramsValue, queryCallback) { }
    OrderBy(qFn) { return this; }
    OrderByDesc(qFn) { return this; }
    Select(qFn) { return this; }
    Take(count) { return this; }
    Skip(count) { return this; }
    Max(qFn) { }
    Min(qFn) { }
    Contains(feild, values) { }
}
exports.EntityObject = EntityObject;
//# sourceMappingURL=entityObject.js.map