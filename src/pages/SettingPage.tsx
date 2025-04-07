import React from "react";
import SettingLayout from "@/layouts/SettingLayout";
import ConnectionPage from "./settings/ConnectionPage";
import UserManagementPage from "./settings/UserManagementPage";
import MiscPage from "./settings/MiscPage";

export default function SettingPage() {
  const [nav, setNav] = React.useState('connection');
  return (
    <SettingLayout nav={nav} setNav={setNav}>
      {
        nav === 'connection' && (
          <div className="flex-1">
            <ConnectionPage />
          </div>
        )
      }

      {
        nav === 'user management' && (
          <UserManagementPage />
        )
      }

      {
        nav === 'misc' && (
          <MiscPage />
        )
      }
    </SettingLayout>
  )
}