import { UserContext } from "@/App";
import React, { useContext } from "react";

export default function Footer() {
  const { user }: any = useContext(UserContext);

  return (
    <footer className="font-tomorrow inline-flex justify-between text-[0.7rem] uppercase text-muted-foreground">
      <p>Powered by MyORI SmartSecure</p>
      <p>Version: <span className="font-bold">1.0.7</span> | Date: <span className="font-bold">13/5/2025</span></p>
    </footer>
  );
}
