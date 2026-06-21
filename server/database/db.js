const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'health_management.db');

let dbInstance = null;

class Database {
  static async init() {
    if (dbInstance) return;
    
    const SQL = await initSqlJs();
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('✅ 数据库连接成功（从文件加载）');
      // 总是重新执行 schema.sql，确保新表也被创建（CREATE TABLE IF NOT EXISTS）
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        try {
          dbInstance.exec(schemaSql);
          console.log('✅ 数据库表结构检查完成');
          Database.save();
        } catch (e) {
          console.warn('⚠️  schema 执行警告（可能表已存在）:', e.message);
        }
      }
    } else {
      dbInstance = new SQL.Database();
      console.log('✅ 数据库连接成功（新数据库）');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        dbInstance.exec(schemaSql);
        console.log('✅ 数据库表结构初始化成功');
        Database.save();
      } else {
        console.warn('⚠️  schema.sql 不存在，表结构未初始化');
      }
    }
  }

  static save() {
    if (!dbInstance) return;
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  static all(sql, params = []) {
    if (!dbInstance) throw new Error('数据库未初始化');
    const stmt = dbInstance.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
      const result = stmt.getAsObject();
      results.push(result);
    }
    stmt.free();
    return results;
  }

  static get(sql, params = []) {
    if (!dbInstance) throw new Error('数据库未初始化');
    const stmt = dbInstance.prepare(sql);
    if (params && params.length > 0) {
      stmt.bind(params);
    }
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static run(sql, params = []) {
    if (!dbInstance) throw new Error('数据库未初始化');
    dbInstance.run(sql, params);
    this.save();
    return {
      lastID: dbInstance.exec('SELECT last_insert_rowid() as id')[0].values[0][0],
      changes: 1
    };
  }

  static exec(sql) {
    if (!dbInstance) throw new Error('数据库未初始化');
    dbInstance.exec(sql);
    this.save();
  }
}

module.exports = {
  db: null,
  Database
};
