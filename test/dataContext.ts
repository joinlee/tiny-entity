import { currentDataBaseType } from './config';
import { EntityObjectFactory } from './entityObjectFactory';
import { MysqlDataContext } from './../mysql/dataContextMysql';
const path = require("path");
const dataRootDir = path.normalize(process.cwd() + '/data/');

import { NeDBDataContext } from './../nedb/dataContextNeDB';
import { IDataContext } from './../tinyDB.d';

const EntityObject = EntityObjectFactory.GetEntityObjectType(currentDataBaseType);
export class User extends EntityObject<User>{

    id: string;
    username: string;
    password: string;
    keyWords: any[];
    toString(): string { return "Users"; }
}

interface ArticleDetail {
    date: number;
    title: string;
    content: string;
}

export class Article extends EntityObject<Article>{
    id: string;
    description: string;
    detail: ArticleDetail;
    userId: string;
    topics: string[];
    toString(): string { return "Articles"; }
}


export interface DataContextBase extends IDataContext {
    user: User;
    article: Article;
}

class DataContextNeDB extends NeDBDataContext implements DataContextBase {
    user: User;
    article: Article;
    constructor() {
        super({ FilePath: dataRootDir + "/", DBName: "", IsMulitTabel: true });
        this.user = new User(this);
        this.article = new Article(this);
    }
}

class DataContextMysql extends MysqlDataContext implements DataContextBase {
    user: User;
    article: Article;
    constructor() {
        super({ "connectionLimit": 500, "database": "test", "host": "localhost", "password": "123456", "user": "root" });
        this.user = new User(this);
        this.article = new Article(this);
    }
}

export class DataContextFactory {
    static GetDataContext(type): DataContextBase {
        if (type == "nedb") return new DataContextNeDB();
        else if (type == "mysql") return new DataContextMysql();
        else {
            throw new Error(type + "type is uncorrent database's type!!!");
        }
    }
}