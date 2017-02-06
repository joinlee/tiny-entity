"use strict";
const config_1 = require('./config');
const entityObjectFactory_1 = require('./entityObjectFactory');
const dataContextMysql_1 = require('./../mysql/dataContextMysql');
const path = require("path");
const dataRootDir = path.normalize(process.cwd() + '/data/');
const dataContextNeDB_1 = require('./../nedb/dataContextNeDB');
const EntityObject = entityObjectFactory_1.EntityObjectFactory.GetEntityObjectType(config_1.currentDataBaseType);
class User extends EntityObject {
    toString() { return "Users"; }
}
exports.User = User;
class Article extends EntityObject {
    toString() { return "Articles"; }
}
exports.Article = Article;
class DataContextNeDB extends dataContextNeDB_1.NeDBDataContext {
    constructor() {
        super({ FilePath: dataRootDir + "/", DBName: "", IsMulitTabel: true });
        this.user = new User(this);
        this.article = new Article(this);
    }
}
class DataContextMysql extends dataContextMysql_1.MysqlDataContext {
    constructor() {
        super({ "connectionLimit": 500, "database": "cns", "host": "115.28.165.242", "password": "mpj2016", "user": "dev" });
        this.user = new User(this);
        this.article = new Article(this);
    }
}
class DataContextFactory {
    static GetDataContext(type = "nedb") {
        if (type == "nedb")
            return new DataContextNeDB();
        else
            return new DataContextMysql();
    }
}
exports.DataContextFactory = DataContextFactory;
//# sourceMappingURL=dataContext.js.map