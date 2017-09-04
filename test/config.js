"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webconfig = {
    dbType: "mysql",
    mysqlConnOption: {
        connectionLimit: 50,
        host: '172.16.254.127',
        user: 'root',
        password: 'onetwo',
        database: 'fbs_db'
    },
    dataRootDir: "./db"
};
class EntityObjectFactory {
    static GetEntityObjectType() {
        if (exports.webconfig.dbType == "nedb") {
            let a = require("../nedb").EntityObjectNeDB;
            return a;
        }
        else if (exports.webconfig.dbType == "mysql") {
            let entityObjectMysql = require("../mysql").EntityObjectMysql;
            return entityObjectMysql;
        }
    }
}
exports.EntityObjectFactory = EntityObjectFactory;
//# sourceMappingURL=config.js.map