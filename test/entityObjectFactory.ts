import { EntityObject } from './../entityObject';
export class EntityObjectFactory {
    static GetEntityObjectType(type) {
        if (type == "nedb") {
            let a: typeof EntityObject = require("./../nedb").EntityObjectNeDB;
            return a;
        }
        else {
            let entityObjectMysql: typeof EntityObject = require("./../mysql");
            return entityObjectMysql;
        }
    }
}
