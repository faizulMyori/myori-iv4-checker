import sqlite, { executeQuery, setdbPath, fetchOne } from "sqlite-electron";
import { hashPassword } from "./password_helpers";

export async function initializeDatabase() {
  try {
    const dbPath = "./database.db";
    const isUri = false;
    await setdbPath(dbPath, isUri);
    initializeSettingsTable();
    initializeBatchesTable();
    initializeUsersTable();
    initializeProductsTable();
    initializeLabelsTable();
    initializeConnectionsDatabase();
    initializeLicensesDatabase();
    initializeStorageTable();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

async function initializeStorageTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS storage_treshold (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          treshold TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}

async function initializeUsersTable() {
  const sql = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);

  const hashedPassword = await hashPassword("admin");  // Hash password
  const insertAdminSql = `
      INSERT INTO users (username, password) VALUES ('admin', ?);
    `;
  await executeQuery(insertAdminSql, [hashedPassword]);  // Use parameterized query to prevent SQL injection
}

async function initializeBatchesTable() {
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
  await executeQuery(sql);
}

async function initializeProductsTable() {
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
  await executeQuery(sql);
}

async function initializeLabelsTable() {
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
  await executeQuery(sql);
}

async function initializeConnectionsDatabase() {
  const sql = `
        CREATE TABLE IF NOT EXISTS connections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip TEXT NOT NULL,
          port INTEGER NOT NULL,
          com TEXT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}

async function initializeLicensesDatabase() {
  const sql = `
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
  await executeQuery(sql);
}

async function initializeSettingsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS excel_path (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      excel_save_path TEXT NOT NULL DEFAULT 'C:/',
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await executeQuery(sql);
}