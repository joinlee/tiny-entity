declare module "sqlite-sync" {
    module e {
        /**
         * 连接数据库
         * @param  {string} db_name 数据库文件名
         */
        function connect(db_name: string);
        /**
         * 运行sql语句
         * @param  {string} queryString 查询语句
         * @param  {[any]} params? 查询参数
         * @param  {any} callback? 回调函数
         * @returns any 如果是insert 返回主键，update 返回成功或失败，select 返回查询结果
         */
        function run(queryString: string, params?: [any], callback?): any;
        function runAsync(queryString: string, params?: [any], callback?): void;
        /**
         * 插入数据
         * @param  {string} tableName 表名称
         * @param  {Object} entityObj 实体对象
         * @param  {any} callback? 回调函数
         * @returns number 主键
         */
        function insert(tableName: string, entityObj: Object, callback?): number;
        /**
         * 修改数据
         * @param  {string} tableName 表名称
         * @param  {Object} entityObj 实体对象
         * @param  {Object} primayKey 主键对象
         * @param  {any} callback? 回调函数
         * @returns boolean 成功或失败
         */
        function update(tableName: string, entityObj: Object, primayKey: Object, callback?): boolean;
    }
    export = e;
}


