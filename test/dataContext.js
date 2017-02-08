"use strict";
const dataContextIndexedDB_1 = require('./../indexedDB/dataContextIndexedDB');
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
        super({ "connectionLimit": 500, "database": "test", "host": "localhost", "password": "123456", "user": "root" });
        this.user = new User(this);
        this.article = new Article(this);
    }
}
class DataContextIndexed extends dataContextIndexedDB_1.IndexedDBDataContext {
    constructor() {
        super("testDB", 3, [{
                TableName: "Users", IndexDefines: [
                    {
                        IndexName: "id",
                        FieldName: "id",
                        IsUnique: true
                    }
                ]
            },
            {
                TableName: "Articles",
                IndexDefines: [
                    {
                        IndexName: "id",
                        FieldName: "id",
                        IsUnique: true
                    }
                ]
            }]);
        this.user = new User(this);
        this.article = new Article(this);
    }
}
class DataContextFactory {
    static GetDataContext(type) {
        if (type == "nedb")
            return new DataContextNeDB();
        else if (type == "mysql")
            return new DataContextMysql();
        else if (type == "indexedDB")
            return new DataContextIndexed();
        else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}
exports.DataContextFactory = DataContextFactory;
//# sourceMappingURL=dataContext.js.map