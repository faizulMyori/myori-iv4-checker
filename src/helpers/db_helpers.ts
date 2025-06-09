import path from 'path';
import { app } from 'electron';
import { hashPassword } from "./password_helpers";
const db = require('better-sqlite3')(path.join(app.getPath('userData'), 'database.db'));
// const db = require('better-sqlite3')('database.db');

// Initialize the database connection
export function initializeDatabase() {
  try {

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    // Initialize tables
    initializeSettingsTable();
    initializeBatchesTable();
    initializeUsersTable();
    initializeProductsTable();
    initializeLabelsTable();
    initializeConnectionsDatabase();
    initializeLicensesDatabase();
    initializeStorageTable();

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database", error);
    throw error;
  }
}

// Get the database instance
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

// Execute a query and return the result
export function executeQuery(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
}

// Fetch all rows from a query
export function fetchAll(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    console.log(stmt.all(...params))
    return stmt.all(...params);
  } catch (error) {
    console.error(`Error fetching all: ${sql}`, error);
    throw error;
  }
}

// Fetch a single row from a query
export function fetchOne<T = any>(sql: string, params: any[] = []): T | undefined {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  } catch (error) {
    console.error(`Error fetching one: ${sql}`, error);
    throw error;
  }
}

// Initialize tables
function initializeStorageTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS storage_treshold (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      treshold TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeUsersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);

  // Check if admin user exists
  const adminExists = fetchOne("SELECT * FROM users WHERE username = 'admin'");
  if (!adminExists) {
    // Create admin user if it doesn't exist
    const hashedPassword = hashPassword("admin");
    const insertAdminSql = `INSERT INTO users (username, password) VALUES ('admin', ?);`;
    executeQuery(insertAdminSql, [hashedPassword]);
  }
}

function initializeBatchesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_no TEXT NOT NULL,
      product_id TEXT NOT NULL,
      shift_number TEXT NOT NULL,
      date TEXT NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeProductsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      type TEXT NOT NULL,
      rating TEXT NOT NULL,
      size TEXT NOT NULL,
      license_id INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeLabelsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial TEXT NOT NULL,
      qr_code TEXT NOT NULL,
      status TEXT NOT NULL,
      batch_id INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeConnectionsDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      port INTEGER NOT NULL,
      com TEXT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeLicensesDatabase() {
  const sql = `
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

function initializeSettingsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS excel_path (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      excel_save_path TEXT NOT NULL DEFAULT 'C:/',
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  executeQuery(sql);
}

// Transaction helper
export function runTransaction(callback: (db: any) => void) {
  const transaction = db.transaction(callback);
  return transaction(db);
}

// Batch insert helper
export function batchInsert(tableName: string, columns: string[], values: any[][]) {
  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  const stmt = db.prepare(sql);

  const insertMany = db.transaction((items: any) => {
    for (const item of items) {
      stmt.run(...item);
    }
  });

  return insertMany(values);
}