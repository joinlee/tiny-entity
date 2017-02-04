import { NeDBDataContext } from './../nedb/dataContextNeDB';
import { IDataContext } from './../tinyDB.d';
import { EntityObject } from './../entityObject';
export class User extends EntityObject<User>{
    id: string;
    username: string;
    password: string;
    keyWord: any[]
    toString(): string { return "User"; }
}

interface ArticleContent {
    date: number;
    title: string;
    content: string;
}

export class Article extends EntityObject<Article>{
    id: string;
    description: string;
    content: ArticleContent;
    toString(): string { return "Article"; }
}


export interface DataContextBase extends IDataContext {
    user: User;
    article: Article;
}

class DataContextNeDB extends NeDBDataContext implements DataContextBase {
    private user: User;
    private article: Article;
    constructor() {
        super({ id: 1 });
    }
}