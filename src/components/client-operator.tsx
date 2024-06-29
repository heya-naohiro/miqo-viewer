
import * as React from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, ChevronsUpDown } from "lucide-react"
import { ConfigDialog } from "./config-dialog";
import { clientConfigSchema, listClientConfig } from "./client-config"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [configlist, setConfigList] = React.useState<Array<string>>([]);
  /// "/Users/syureneko/Library/Application Support/com.tauri.dev/"
  React.useEffect(() => {
    listClientConfig().then(names => {
      setConfigList(names)
    })
  }, []);

  return (<>
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">New Client</Button></DialogTrigger>
      <DialogContent><ConfigDialog /></DialogContent>
    </Dialog>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
        >
          {value
            ? configlist.find((c) => c === value)
            : "Select config..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandInput placeholder="Search config..." className="h-9" />
            <CommandList>
              <CommandEmpty>No config found</CommandEmpty>
              <CommandGroup>
                {configlist.map((configname) => (
                  <CommandItem
                    key={configname}
                    value={configname}
                    onSelect={(configName) => {
                      setValue(configName === value ? "" : configName)
                      setOpen(false)
                    }}
                  >
                    {configname}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === configname ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </PopoverTrigger>
    </Popover>
    {/*<Button type="submit">Connect</Button>*/}</>)
}