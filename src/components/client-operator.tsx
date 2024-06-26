
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfigDialog } from "./config-dialog";
import { clientConfigSchema } from "./client-config"
function startConnect(url: String) {
  invoke('start_connect', { url })
}

// send config event to backend
function onConnect(values: z.infer<typeof clientConfigSchema>) {
  console.log(values)
  const url = 'tcp://' + values.hostname + ':' + String(values.port)
  startConnect(url);
}

export function ProfileForm() {

  return (<>
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">New Client</Button></DialogTrigger>
      <DialogContent><ConfigDialog /></DialogContent>
    </Dialog>
    <Button type="submit">Connect</Button></>)
}