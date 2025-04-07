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
  DB_SEARCH_LICENSES,
  DB_DELETE_LICENSE,
  DB_GET_LICENSES,
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
  DB_GET_STORAGE_TRESHOLD
} from "./db-channels";

export function exposeDBContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("sqlite", {
    db_login: (username: any, password: any) => ipcRenderer.invoke(DB_LOGIN, { username, password }),

    create_product: (data: any) => ipcRenderer.invoke(DB_CREATE_PRODUCT, data),
    get_products: () => ipcRenderer.invoke(DB_GET_PRODUCTS),
    search_products: (query: string) => ipcRenderer.invoke(DB_SEARCH_PRODUCTS, query),
    update_product: (data: any) => ipcRenderer.invoke(DB_UPDATE_PRODUCT, data),
    delete_product: (id: number) => ipcRenderer.invoke(DB_DELETE_PRODUCT, id),

    create_license: (data: any) => ipcRenderer.invoke(DB_CREATE_LICENSE, data),
    get_licenses: () => ipcRenderer.invoke(DB_GET_LICENSES),
    search_licenses: (query: string) => ipcRenderer.invoke(DB_SEARCH_LICENSES, query),
    update_license: (data: any) => ipcRenderer.invoke(DB_UPDATE_LICENSE, data),
    delete_license: (id: number) => ipcRenderer.invoke(DB_DELETE_LICENSE, id),

    create_user: (data: any) => ipcRenderer.invoke(DB_CREATE_USER, data),
    get_users: () => ipcRenderer.invoke(DB_GET_USERS),
    search_users: (query: string) => ipcRenderer.invoke(DB_SEARCH_USERS, query),
    update_user: (data: any) => ipcRenderer.invoke(DB_UPDATE_USER, data),
    delete_user: (id: number) => ipcRenderer.invoke(DB_DELETE_USER, id),

    create_batch: (data: any) => ipcRenderer.invoke(DB_CREATE_BATCH, data),
    get_batchs: () => ipcRenderer.invoke(DB_GET_BATCHS),
    search_batchs: (query: string) => ipcRenderer.invoke(DB_SEARCH_BATCHS, query),
    update_batch: (data: any) => ipcRenderer.invoke(DB_UPDATE_BATCH, data),
    delete_batch: (id: number) => ipcRenderer.invoke(DB_DELETE_BATCH, id),

    create_label: (data: any) => ipcRenderer.invoke(DB_CREATE_LABEL, data),
    get_labels: () => ipcRenderer.invoke(DB_GET_LABELS),
    search_labels: (query: string) => ipcRenderer.invoke(DB_SEARCH_LABELS, query),
    update_label: (data: any) => ipcRenderer.invoke(DB_UPDATE_LABEL, data),
    delete_label: (id: number) => ipcRenderer.invoke(DB_DELETE_LABEL, id),
    check_serial_numbers: (data: any) => ipcRenderer.invoke(DB_FIND_LABEL, data),

    create_storage_treshold: (value: any) => ipcRenderer.invoke(DB_CREATE_STORAGE_TRESHOLD, value),
    get_storage_treshold: () => ipcRenderer.invoke(DB_GET_STORAGE_TRESHOLD),

    create_connection: (ip: any, port: any, com: any) => ipcRenderer.invoke(DB_CREATE_CONNECTION, { ip, port, com }),
    get_connections: () => ipcRenderer.invoke(DB_GET_CONNECTIONS),
  });
}
