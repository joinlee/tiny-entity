import { EntityObject } from './../entityObject';
export class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let result: typeof EntityObject = require("./../nedb").EntityObjectNeDB;
            return result;
        }
        else if (type == "mysql") {
            let result: typeof EntityObject = require("./../mysql").EntityObjectMysql;
            return result;
        } else if (type == "indexedDB") {
            let result: typeof EntityObject = require("./../indexedDb").EntityObjectIndexedDB;
            return result;
        } else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}
