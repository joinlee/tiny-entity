"use strict";
class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let a = require("./../nedb").EntityObjectNeDB;
            return a;
        }
        else {
            let entityObjectMysql = require("./../mysql");
            return entityObjectMysql;
        }
    }
}
exports.EntityObjectFactory = EntityObjectFactory;
//# sourceMappingURL=entityObjectFactory.js.map