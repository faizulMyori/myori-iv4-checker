import { BrowserWindow, ipcMain } from "electron";
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
} from "sqlite-electron";
import { checkPassword, hashPassword } from "../../password_helpers";
import { WIN_DIALOG_INFO } from "../window/window-channels";

export function addDBEventListeners() {
  ipcMain.handle(DB_LOGIN, async (event, data) => {
    let username: string = data.username;
    let password: string = data.password;

    try {
      const result: any = await fetchOne("SELECT * FROM users WHERE username = ?", [username]);

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
      return false;
    }
  });

  ipcMain.handle(DB_CREATE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO products (sku, brand, model, type, rating, size, license_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_PRODUCTS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_PRODUCTS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM products WHERE sku LIKE ? OR brand LIKE ? OR model LIKE ? OR type LIKE ? OR rating LIKE ? OR size LIKE ? or license_id LIKE ?", [`%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("UPDATE products SET sku = ?, brand = ?, model = ?, type = ?, rating = ?, size = ?, license_id = ? WHERE id = ?", [data.sku, data.brand, data.model, data.type, data.rating, data.size, data.license_id, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_PRODUCT, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM products WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });

  // licenses
  ipcMain.handle(DB_CREATE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO licenses (name, code) VALUES (?, ?)", [data.name, data.code]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_LICENSES, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM licenses");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_LICENSES, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM licenses WHERE name LIKE ? OR code LIKE ? ", [`%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("UPDATE licenses SET name = ?, code = ? WHERE id = ?", [data.name, data.code, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_LICENSE, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM licenses WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });

  // users
  ipcMain.handle(DB_CREATE_USER, async (event, data) => {
    try {
      return await executeQuery("INSERT INTO users (username, password) VALUES (?, ?)", [data.username, hashPassword(data.password)]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_USERS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM users");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_USERS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM users WHERE username LIKE ? ", [`%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_USER, async (event, data) => {
    try {
      return await executeQuery("UPDATE users SET username = ? WHERE id = ?", [data.username, data.id]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_USER, async (event, data) => {
    try {
      return await executeQuery("DELETE FROM users WHERE id = ?", [data]);
    } catch (error) {
      return false;
    }
  });

  // batches
  ipcMain.handle(DB_CREATE_BATCH, async (event, data) => {
    try {
      let create = await executeQuery("INSERT INTO batches (batch_no, shift_number, product_id, date) VALUES (?, ?, ?, ?)", [data.batch_no, data.shift_number, data.product_id, data.date]);
      if (create) return await fetchOne("SELECT * FROM batches WHERE shift_number = ? AND batch_no = ?", [data.shift_number, data.batch_no]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_BATCHS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM batches");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_BATCHS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM batches WHERE batch_no LIKE ? OR shift_number LIKE ? ", [`%${data}%`, `%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_BATCH, async (event, data) => {
    try {
      return await executeQuery("UPDATE batches SET batch_no = ?, shift_number = ?, product_id = ?, date = ? WHERE id = ?",
        [data.batch_no, data.shift_number, data.product_id, data.date, data.id]);
    } catch (error) {
      console.error("Failed to update batch:", error);
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_BATCH, async (event, data) => {
    try {
      await executeQuery("DELETE FROM batches WHERE id = ?", [data]);
      return true;
    } catch (error) {
      console.error("Error deleting batch:", error);
      return false;
    }
  });

  const batchQueue: any = [];
  const BATCH_SIZE = 20;
  const BATCH_INTERVAL = 100; // ms
  // Timer to flush queue periodically
  setInterval(() => {
    if (batchQueue.length > 0) {
      flushBatch();
    }
  }, BATCH_INTERVAL);

  function flushBatch() {
    if (batchQueue.length === 0) return;

    const batch = batchQueue.splice(0, BATCH_SIZE);

    const valuesClause = batch.map(() => "(?, ?, ?, ?)").join(", ");
    const params = batch.flatMap(({ data }: any) => [
      data.serial,
      data.qr_code,
      data.status,
      data.batch_id,
    ]);

    const query = `INSERT INTO labels (serial, qr_code, status, batch_id) VALUES ${valuesClause}`;

    executeQuery(query, params)
      .then(result => {
        batch.forEach(({ resolve }: any) => resolve(result));
      })
      .catch((err: any) => {
        batch.forEach(({ reject }: any) => reject(err));
      });
  }

  // Handler
  ipcMain.handle(DB_CREATE_LABEL, async (event, data) => {
    return new Promise((resolve, reject) => {
      batchQueue.push({ data, resolve, reject });
      // Optional: flush immediately if batch size is reached
      if (batchQueue.length >= BATCH_SIZE) {
        flushBatch();
      }
    });
  });

  ipcMain.handle(DB_GET_LABELS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM labels");
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_SEARCH_LABELS, async (event, data) => {
    try {
      return await fetchAll("SELECT * FROM labels WHERE serial LIKE ? ", [`%${data}%`]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_UPDATE_LABEL, async (event, data) => {
    try {
      // return await executeQuery("UPDATE labels SET username = ? WHERE id = ?", [data.username, data.id]);
      return true
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_FIND_LABEL, async (event, data) => {
    let startNo = data.startNumber || "";
    let endNo = data.endNumber || "";

    try {
      let data: any = await fetchAll("SELECT * FROM labels WHERE serial BETWEEN ? AND ?", [startNo, endNo]);
      // if (data.length > 0) {
      //   let serials = data.map((item: any) => item.serial);
      //   ipcMain.emit(WIN_DIALOG_INFO, {
      //     title: "Overlap Found",
      //     message: `Overlap Serials: ${serials.join(", ")}`,
      //   });
      // }
      return data
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_DELETE_LABEL, async (event, data) => {
    try {
      // Check if data is a number (ID) or string (serial)
      const isId = typeof data === 'number';
      const query = isId ? "DELETE FROM labels WHERE id = ?" : "DELETE FROM labels WHERE serial = ?";
      const result = await executeQuery(query, [data]);
      return result;
    } catch (error) {
      console.error("Error deleting label:", error);
      return false;
    }
  });

  ipcMain.handle(DB_CREATE_CONNECTION, async (event, data) => {
    // console.log(data)
    try {
      let deleteConnection = await executeQuery("DELETE FROM connections");

      if (deleteConnection) return await executeQuery("INSERT INTO connections (ip, port, com) VALUES (?, ?, ?)", [data.ip, data.port, data.com]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_CONNECTIONS, async (event) => {
    try {
      let data: any = await fetchOne("SELECT * FROM connections ORDER BY id DESC LIMIT 1");
      return data
    } catch (error) {
      return error;
    }
  });

  ipcMain.handle(DB_CREATE_EXCEL_SAVE_PATH, async (event, data) => {
    try {
      await executeQuery("DELETE FROM excel_path");
      await executeQuery(
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
      const excel_save = await fetchOne<{ excel_save_path: string }>("SELECT * FROM excel_path ORDER BY id DESC LIMIT 1");
      console.log("Raw database excel_save:", excel_save);

      if (!excel_save) {
        console.log("No data found in excel_path table, returning default");
        return { path: "C:/" };
      }

      // Get the first (most recent) entry
      const path = excel_save.excel_save_path;
      console.log("Returning saved path:", excel_save);
      return { path };
    } catch (error) {
      console.error("Error retrieving Excel save path:", error);
      return { path: "C:/" };
    }
  });


  ipcMain.handle(DB_CREATE_STORAGE_TRESHOLD, async (event, data) => {
    try {
      let deleteTreshold = await executeQuery("DELETE FROM storage_treshold");

      if (deleteTreshold) return await executeQuery("INSERT INTO storage_treshold (treshold) VALUES (?)", [data]);
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle(DB_GET_STORAGE_TRESHOLD, async (event, data) => {
    try {
      let storage: any = await fetchOne("SELECT * FROM storage_treshold ORDER BY id DESC LIMIT 1");
      return storage
    } catch (error) {
      return false;
    }
  });
  // Add new handler for raw SQL queries
  ipcMain.handle('db:fetchAll', async (event, { query, params = [] }) => {
    try {
      return await fetchAll(query, params);
    } catch (error) {
      console.error('Error executing raw query:', error);
      return false;
    }
  });
}
