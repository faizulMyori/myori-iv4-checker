import { ipcMain } from "electron";
import {
  DB_LOGIN,
  DB_DELETE_PRODUCT,
  DB_UPDATE_PRODUCT,
  DB_CREATE_PRODUCT,
  DB_GET_PRODUCTS,
  DB_SEARCH_PRODUCTS,
  DB_CREATE_CONNECTION,
  DB_GET_CONNECTIONS,
  DB_CREATE_LICENSE,
  DB_DELETE_LICENSE,
  DB_GET_LICENSES,
  DB_SEARCH_LICENSES,
  DB_UPDATE_LICENSE,
  DB_CREATE_USER,
  DB_DELETE_USER,
  DB_GET_USERS,
  DB_SEARCH_USERS,
  DB_UPDATE_USER,
  DB_CREATE_BATCH,
  DB_DELETE_BATCH,
  DB_GET_BATCHS,
  DB_SEARCH_BATCHS,
  DB_UPDATE_BATCH,
  DB_CREATE_LABEL,
  DB_DELETE_LABEL,
  DB_GET_LABELS,
  DB_SEARCH_LABELS,
  DB_UPDATE_LABEL,
  DB_FIND_LABEL,
  DB_CREATE_STORAGE_TRESHOLD,
  DB_GET_STORAGE_TRESHOLD,
  DB_CREATE_EXCEL_SAVE_PATH,
  DB_GET_EXCEL_SAVE_PATH,
} from "./db-channels";

import {
  executeQuery,
  fetchAll,
  fetchOne,
  getDb,
  batchInsert,
  runTransaction
} from "../../db_helpers";
import { checkPassword, hashPassword } from "../../password_helpers";

export function addDBEventListeners() {
  ipcMain.handle(DB_LOGIN, async (event, data) => {
    let username: string = data.username;
    let password: string = data.password;

    try {
      const result: any = fetchOne("SELECT * FROM users WHERE username = ?", [username]);

      if (result) {
        const hashedPassword = result.password;
        const isPasswordMatch = await checkPassword(password, hashedPassword);
        if (isPasswordMatch) {
          return result;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_CREATE_PRODUCT, async (event, data) => {
    try {
      const result = executeQuery(
        "INSERT INTO products (sku, brand, model, type, rating, size, license_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id]
      );
      return result;
    } catch (error) {
      console.error("Create product error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_PRODUCTS, async (event, data) => {
    try {
      return fetchAll("SELECT * FROM products");
    } catch (error) {
      console.error("Get products error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_PRODUCTS, async (event, data) => {
    try {
      return fetchAll(
        "SELECT * FROM products WHERE sku LIKE ? OR brand LIKE ? OR model LIKE ? OR type LIKE ? OR rating LIKE ? OR size LIKE ? or license_id LIKE ?",
        [`%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`]
      );
    } catch (error) {
      console.error("Search products error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_PRODUCT, async (event, data) => {
    try {
      return executeQuery(
        "UPDATE products SET sku = ?, brand = ?, model = ?, type = ?, rating = ?, size = ?, license_id = ? WHERE id = ?",
        [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id, data.id]
      );
    } catch (error) {
      console.error("Update product error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_PRODUCT, async (event, data) => {
    try {
      return executeQuery("DELETE FROM products WHERE id = ?", [data]);
    } catch (error) {
      console.error("Delete product error:", error);
      return false;
    }
  });

  // licenses
  ipcMain.handle(DB_CREATE_LICENSE, async (event, data) => {
    try {
      return executeQuery("INSERT INTO licenses (name, code) VALUES (?, ?)", [data.name, data.code]);
    } catch (error) {
      console.error("Create license error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_LICENSES, async (event, data) => {
    try {
      return fetchAll("SELECT * FROM licenses");
    } catch (error) {
      console.error("Get licenses error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_LICENSES, async (event, data) => {
    try {
      return fetchAll(
        "SELECT * FROM licenses WHERE name LIKE ? OR code LIKE ? ",
        [`%${data}%`, `%${data}%`]
      );
    } catch (error) {
      console.error("Search licenses error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_LICENSE, async (event, data) => {
    try {
      return executeQuery(
        "UPDATE licenses SET name = ?, code = ? WHERE id = ?",
        [data.name, data.code, data.id]
      );
    } catch (error) {
      console.error("Update license error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_LICENSE, async (event, data) => {
    try {
      return executeQuery("DELETE FROM licenses WHERE id = ?", [data]);
    } catch (error) {
      console.error("Delete license error:", error);
      return false;
    }
  });

  // users
  ipcMain.handle(DB_CREATE_USER, async (event, data) => {
    try {
      const hashedPwd = await hashPassword(data.password);
      return executeQuery(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [data.username, hashedPwd]
      );
    } catch (error) {
      console.error("Create user error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_USERS, async (event, data) => {
    try {
      return fetchAll("SELECT * FROM users");
    } catch (error) {
      console.error("Get users error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_USERS, async (event, data) => {
    try {
      return fetchAll(
        "SELECT * FROM users WHERE username LIKE ? ",
        [`%${data}%`]
      );
    } catch (error) {
      console.error("Search users error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_USER, async (event, data) => {
    try {
      return executeQuery(
        "UPDATE users SET username = ? WHERE id = ?",
        [data.username, data.id]
      );
    } catch (error) {
      console.error("Update user error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_USER, async (event, data) => {
    try {
      return executeQuery("DELETE FROM users WHERE id = ?", [data]);
    } catch (error) {
      console.error("Delete user error:", error);
      return false;
    }
  });

  // batches
  ipcMain.handle(DB_CREATE_BATCH, async (event, data) => {
    try {
      const result = executeQuery(
        "INSERT INTO batches (batch_no, shift_number, product_id, date) VALUES (?, ?, ?, ?)",
        [data.batch_no, data.shift_number, data.product_id, data.date]
      );
      if (result) {
        return fetchOne("SELECT * FROM batches WHERE shift_number = ? AND batch_no = ?", [data.shift_number, data.batch_no]);
      }
      return false;
    } catch (error) {
      console.error("Create batch error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_BATCHS, async (event, data) => {
    try {
      return fetchAll("SELECT * FROM batches");
    } catch (error) {
      console.error("Get batches error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_BATCHS, async (event, data) => {
    try {
      return fetchAll(
        "SELECT * FROM batches WHERE batch_no LIKE ? OR shift_number LIKE ? ",
        [`%${data}%`, `%${data}%`]
      );
    } catch (error) {
      console.error("Search batches error:", error);
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_BATCH, async (event, data) => {
    try {
      return executeQuery(
        "UPDATE batches SET batch_no = ?, shift_number = ?, product_id = ?, date = ? WHERE id = ?",
        [data.batch_no, data.shift_number, data.product_id, data.date, data.id]
      );
    } catch (error) {
      console.error("Failed to update batch:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_BATCH, async (event, data) => {
    try {
      executeQuery("DELETE FROM batches WHERE id = ?", [data]);
      return true;
    } catch (error) {
      console.error("Error deleting batch:", error);
      return false;
    }
  });

  // Optimized batch insert for labels
  ipcMain.handle(DB_CREATE_LABEL, async (event, data) => {
    try {
      const result = executeQuery(
        "INSERT INTO labels (serial, qr_code, status, batch_id) VALUES (?, ?, ?, ?)",
        [data.serial, data.qr_code, data.status, data.batch_id]
      );
      return result;
    } catch (error) {
      console.error("Error creating label:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_LABELS, async (event, data) => {
    try {
      return fetchAll("SELECT * FROM labels");
    } catch (error) {
      console.error("Error getting labels:", error);
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_LABELS, async (event, data) => {
    try {
      return fetchAll(
        "SELECT * FROM labels WHERE serial LIKE ? ",
        [`%${data}%`]
      );
    } catch (error) {
      console.error("Error searching labels:", error);
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_LABEL, async (event, data) => {
    try {
      // Not implemented in original code
      return true;
    } catch (error) {
      console.error("Error updating label:", error);
      return false;
    }
  });

  ipcMain.handle(DB_FIND_LABEL, async (event, data) => {
    let startNo = data.startNumber || "";
    let endNo = data.endNumber || "";

    try {
      return fetchAll(
        "SELECT * FROM labels WHERE serial BETWEEN ? AND ?",
        [startNo, endNo]
      );
    } catch (error) {
      console.error("Error finding labels:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_LABEL, async (event, data) => {
    try {
      // Check if data is a number (ID) or string (serial)
      const isId = typeof data === 'number';
      const query = isId ? "DELETE FROM labels WHERE id = ?" : "DELETE FROM labels WHERE serial = ?";
      const result = executeQuery(query, [data]);
      return result;
    } catch (error) {
      console.error("Error deleting label:", error);
      return false;
    }
  });

  ipcMain.handle(DB_CREATE_CONNECTION, async (event, data) => {
    try {
      // First delete all existing connections
      executeQuery("DELETE FROM connections");
      // Then insert the new connection
      return executeQuery(
        "INSERT INTO connections (ip, port, com) VALUES (?, ?, ?)",
        [data.ip, data.port, data.com]
      );
    } catch (error) {
      console.error("Error creating connection:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_CONNECTIONS, async (event) => {
    try {
      return fetchOne("SELECT * FROM connections ORDER BY id DESC LIMIT 1");
    } catch (error) {
      console.error("Error getting connections:", error);
      return error;
    }
  });

  ipcMain.handle(DB_CREATE_EXCEL_SAVE_PATH, async (event, data) => {
    try {
      executeQuery("DELETE FROM excel_path");
      executeQuery(
        "INSERT INTO excel_path (excel_save_path) VALUES (?)",
        [JSON.stringify(data)]
      );
      return true;
    } catch (error) {
      console.error("Error saving Excel save path:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_EXCEL_SAVE_PATH, async (event, data) => {
    try {
      // Get all entries from excel_path table
      const excel_save = fetchOne<{ excel_save_path: string }>("SELECT * FROM excel_path ORDER BY id DESC LIMIT 1");

      if (!excel_save) {
        console.log("No data found in excel_path table, returning default");
        return { path: "C:/" };
      }

      // Get the first (most recent) entry
      const path = excel_save.excel_save_path;
      return { path };
    } catch (error) {
      console.error("Error retrieving Excel save path:", error);
      return { path: "C:/" };
    }
  });

  ipcMain.handle(DB_CREATE_STORAGE_TRESHOLD, async (event, data) => {
    try {
      executeQuery("DELETE FROM storage_treshold");
      return executeQuery("INSERT INTO storage_treshold (treshold) VALUES (?)", [data]);
    } catch (error) {
      console.error("Error creating storage threshold:", error);
      return false;
    }
  });

  ipcMain.handle(DB_GET_STORAGE_TRESHOLD, async (event, data) => {
    try {
      return fetchOne("SELECT * FROM storage_treshold ORDER BY id DESC LIMIT 1");
    } catch (error) {
      console.error("Error getting storage threshold:", error);
      return false;
    }
  });

  // Add new handler for raw SQL queries
  ipcMain.handle('db:fetchAll', async (event, { query, params = [] }) => {
    try {
      return fetchAll(query, params);
    } catch (error) {
      console.error('Error executing raw query:', error);
      return false;
    }
  });
}