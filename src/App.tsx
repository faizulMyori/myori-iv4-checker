import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster, toast } from "sonner"
import { WIN_TOAST } from "./helpers/ipc/window/window-channels";
import { useProductionState } from "./pages/production/hooks/use-production-state";

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
      };
    };
  }
}

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  title: string;
  description?: string;
  type: ToastType;
}

export type UserContextType = {
  user: null | undefined;
  setUser: React.Dispatch<React.SetStateAction<null | undefined>>;
  conn: "failed" | "connecting" | "connected" | "idle";
  setConn: React.Dispatch<React.SetStateAction<"idle" | "connecting" | "connected" | "failed" | "disconnecting">>;
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
  prodStatus: "started" | "stopped";
  setProdStatus: React.Dispatch<React.SetStateAction<"started" | "stopped" | "hold">>;
};

export const UserContext = React.createContext<UserContextType | null>(null);

export default function App() {
  const [user, setUser] = useState<null | undefined>(null);
  const [conn, setConn] = useState("failed");
  const [route, setRoute] = useState("");
  const [prodStatus, setProdStatus] = useState("stopped");

  const { i18n } = useTranslation();

  useEffect(() => {
    syncThemeWithLocal();
    updateAppLanguage(i18n);
    const handleToast = (_: any, { title, description, type }: ToastMessage) => {
      console.log('Toast received:', { title, description, type });
      toast[type](title, { description });
    };
    window.electron.ipcRenderer.on('win-toast', handleToast);
    return () => {
      window.electron.ipcRenderer.on('win-toast', handleToast);
    };
  }, [i18n]);

  useEffect(() => {
    const handleConnection = async () => {
      try {
        const resp: any = await window.sqlite.get_connections();
        if (resp) {
          setConn("connecting");
          try {
            await window.tcpConnection.tcp_connect({ ip: resp.ip, port: resp.port });
            await window.serial.serial_com_open({ com: resp.com })
            setConn("connected");
          } catch {
            setConn("failed");
          }
        } else {
          setConn("failed");
        }
      } catch {
        setConn("failed");
      }
    };
    handleConnection();
    window.disk.disk_check_space('D:/').then(
      (resp: any) => {
        if (resp) {
          console.log(resp)
          // setConn("idle");
        }
      }
    )
    window.tcpConnection.tcp_closed(renderConnectionStatus);
    window.tcpConnection.tcp_connected(renderConnectionConnected);
  }, []);

  const renderConnectionStatus = useCallback(() => {
    setConn("idle");
  }, []);

  useEffect(() => {
    if (conn === "idle" && prodStatus === "started") {
      window.serial.serial_com_send("@0101\r");
    }
  }, [conn, prodStatus]);

  const renderConnectionConnected = useCallback(() => {
    setConn("connected");
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, conn, setConn, route, setRoute, prodStatus, setProdStatus } as UserContextType}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(
  // <React.StrictMode>
  <>
    <Toaster position="top-right" richColors closeButton />
    <App />
  </>
  // </React.StrictMode>
);

