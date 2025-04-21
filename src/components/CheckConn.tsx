import { MonitorCheck, MonitorCog, MonitorDot, MonitorDown, MonitorStop, Moon } from "lucide-react";
import React, { useContext } from "react";
import { UserContext } from "@/App";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from "@tanstack/react-router";

export default function CheckConn() {
  const { conn, setConn, user, route, setRoute, prodStatus }: any = useContext(UserContext);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link disabled={prodStatus === 'started' || prodStatus === 'hold'} to={user ? "/setting" : "/"} onClick={() => setRoute(user ? "/setting" : "/")}>
            {conn === "connected" && (<MonitorCheck className="h-8 w-8 text-green-500" />)}
            {conn === "failed" && (<MonitorDown className="h-8 w-8 text-red-500" />)}
            {conn === "connecting" && (<MonitorCog className="h-8 w-8 text-yellow-500" />)}
            {conn === "idle" && (<MonitorDot className="h-8 w-8 text-gray-500" />)}
            {conn === "disconnecting" && (<MonitorStop className="h-8 w-8 text-orange-500" />)}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{conn.toUpperCase()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
