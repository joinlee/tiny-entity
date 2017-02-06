"use strict";
class seedData {
    static getUser() {
        return JSON.parse(seedData.userStr);
    }
    static getArticle() {
        return JSON.parse(seedData.articleStr);
    }
}
seedData.userStr = `{"id":"${new Date().getTime()}","username":"username${new Date().getTime()}","password":"password${new Date().getTime()}","keyWords":["keyWord1","keyWord2","keyWord3${new Date().getTime()}"]}`;
seedData.articleStr = `{"id":"${new Date().getTime()}","description":"description${new Date().getTime()}","userId":"${new Date().getTime()}","content":{"date":"${new Date().getTime()}","title":"title${new Date().getTime()}","content":"content${new Date().getTime()}content${new Date().getTime()}"}`;
exports.seedData = seedData;
//# sourceMappingURL=seed.js.map