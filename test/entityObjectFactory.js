"use strict";
class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let result = require("./../nedb").EntityObjectNeDB;
            return result;
        }
        else if (type == "mysql") {
            let result = require("./../mysql").EntityObjectMysql;
            return result;
        }
        else if (type == "indexedDB") {
            let result = require("./../indexedDb").EntityObjectIndexedDB;
            return result;
        }
        else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}
exports.EntityObjectFactory = EntityObjectFactory;
//# sourceMappingURL=entityObjectFactory.js.map