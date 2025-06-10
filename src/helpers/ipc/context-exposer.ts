import { exposeDBContext } from "./db/db-context";
import { exposeDiskContext } from "./disk/disk-context";
import { exposeExcelContext } from "./excel/excel-context";
import { exposeLicenseContext } from "./license/license-context";
import { exposeSERIALContext } from "./serial/serial-context";
import { exposeTCPContext } from "./tcp/tcp-context";
import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeDBContext();
  exposeTCPContext();
  exposeExcelContext();
  exposeSERIALContext();
  exposeDiskContext();
  exposeLicenseContext();
}
