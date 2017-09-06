import { EntityObject } from "../index";
process.env.tinyLog = "on";
export let webconfig = {
    dbType: "mysql",
    mysqlConnOption: {
        connectionLimit: 50,
        host: '172.16.254.127',
        user: 'root',
        password: 'onetwo',
        database: 'fbs_db'
    },
    dataRootDir: "./db"
}
export class EntityObjectFactory {
    static GetEntityObjectType() {
        if (webconfig.dbType == "nedb") {
            let a: typeof EntityObject = require("../nedb").EntityObjectNeDB;
            return a;
        }
        else if (webconfig.dbType == "mysql") {
            let entityObjectMysql: typeof EntityObject = require("../mysql").EntityObjectMysql;
            return entityObjectMysql;
        }
    }
}