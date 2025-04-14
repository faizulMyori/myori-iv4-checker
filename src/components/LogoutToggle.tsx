import { Moon } from "lucide-react";
import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { FormDialog } from "./FormDialog";
import { UserContext } from "@/App";
import { ConfirmDialog } from "./ConfirmDialog";
import { useNavigate } from "@tanstack/react-router";

export default function LogoutToggle() {
  const [openLogout, setOpenLogout] = useState(false);
  const { user, setUser, setRoute, prodStatus }: any = useContext(UserContext);
  const navigate = useNavigate();
  const toggleLogout = () => {
    console.log('masuk')

    setOpenLogout(!openLogout);
  };

  const handleSubmit = async () => {
    setUser(null)
    setRoute('/')
    navigate({ to: '/' })
  };

  return (
    <>
      <Button variant="destructive" onClick={toggleLogout} disabled={prodStatus === 'started' || prodStatus === 'hold'}>
        Logout
      </Button>

      {
        openLogout && (
          <ConfirmDialog
            open={openLogout}
            setConfirm={handleSubmit}
            title="Confirm to logout?"
            setOpen={setOpenLogout}
          />
        )
      }

    </>
  );
}

