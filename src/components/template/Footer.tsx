import { UserContext } from "@/App";
import React, { useContext } from "react";

export default function Footer() {
  const { user }: any = useContext(UserContext);

  return (
    <footer className="font-tomorrow inline-flex justify-between text-[0.7rem] uppercase text-muted-foreground">
      <p>Powered by MyORI SmartSecure</p>
      {
        user && <p>Welcome, <span className="font-bold">{user?.username}</span></p>
      }
    </footer>
  );
}
