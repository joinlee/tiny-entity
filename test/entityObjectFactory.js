"use strict";
class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let a = require("./../nedb").EntityObjectNeDB;
            return a;
        }
        else if (type == "mysql") {
            let entityObjectMysql = require("./../mysql").EntityObjectMysql;
            return entityObjectMysql;
        }
        else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}
exports.EntityObjectFactory = EntityObjectFactory;
//# sourceMappingURL=entityObjectFactory.js.map