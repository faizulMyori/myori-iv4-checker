import { Moon } from "lucide-react";
import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { FormDialog } from "./FormDialog";
import { UserContext } from "@/App";

export default function LoginToggle() {
  const [openLogin, setOpenLogin] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { user, setUser }: any = useContext(UserContext);

  const toggleLogin = () => {
    setOpenLogin(!openLogin);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const login: any = await window.sqlite.db_login(form.username, form.password);
      if (login) {
        console.log(login)
        setOpenLogin(false);
        setUser(login);
      } else {
        setError('Please enter invalid credentials.')
      }
    } catch (error) {
      console.log(error)
      setError('Please enter valid credentials.')
    }
  };

  return (
    <>
      <Button onClick={toggleLogin}>
        Login
      </Button>

      {
        openLogin && (
          <FormDialog
            setOpenForm={setOpenLogin}
            openDialog={openLogin}
            setConfirmForm={handleSubmit}
            title={`Login`}
            forms={<Form data={form} setData={setForm} error={error} />}
            processing={false}
          />
        )
      }

    </>
  );
}

function Form({ data, setData, error }: { data: any; setData: any; error: any }) {
  function updateInputValue(evt: any) {
    const val = evt.target.value;

    setData({
      ...data,
      [evt.target.id]: val,
    });
  }

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          placeholder="Enter your username"
          className="col-span-3"
          onChange={updateInputValue}
          value={data.username ?? ""}
        />
        <Label htmlFor="password" className="text-right">
          Password
        </Label>
        <Input
          id="password"
          placeholder="Enter your password"
          className="col-span-3"
          type="password"
          onChange={updateInputValue}
          value={data.password ?? ""}
        />
        {
          error && (
            <div className="text-right text-xs col-span-4 text-red-500">{error}</div>
          )
        }
      </div>

    </>
  );
}

