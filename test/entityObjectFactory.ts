import { EntityObject } from './../entityObject';
export class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let a: typeof EntityObject = require("./../nedb").EntityObjectNeDB;
            return a;
        }
        else if (type == "mysql") {
            let entityObjectMysql: typeof EntityObject = require("./../mysql").EntityObjectMysql;
            return entityObjectMysql;
        } else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}
