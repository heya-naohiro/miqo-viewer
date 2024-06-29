import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { clientConfigSchema, MQTTAuthType, MQTTProtocol, MQTTVersion } from "./client-config"
import { saveClientConfig } from "./client-config";



function startConnect(url: String) {
  invoke('start_connect', { url })
}

export function ConfigDialog() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof clientConfigSchema>>({
    resolver: zodResolver(clientConfigSchema),
    defaultValues: {
      name: "new client",
      hostname: "",
      port: 1883,
      protocol: MQTTProtocol.TCP,
      mqtt_version: MQTTVersion.Auto,
      auth_type: MQTTAuthType.None,
      password_auth: false,
      mtls: false,
      username: "",
      password: "",
      clientcertfilepath: "",
      clientkeyfilepath: "",
      client_id: "",
    },
  })
  const watchAuthTogle = form.watch("password_auth", false);
  const watchMtlsTogle = form.watch("mtls", false);


  // send config event to backend
  function onSubmit(values: z.infer<typeof clientConfigSchema>) {
    console.log(values);
    saveClientConfig(values)
  }
  function onError(err: any) {
    console.log(err);
  }
  return (
    <>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <DialogHeader><DialogTitle>Client Setting</DialogTitle>
            <DialogDescription>
              mqtt client settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-6">
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={MQTTProtocol.TCP}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select protocol type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MQTTProtocol.TCP}>{MQTTProtocol.TCP}</SelectItem>
                        <SelectItem value={MQTTProtocol.TLS}>{MQTTProtocol.TLS}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
            </div>
            <div className="col-span-4">
              <FormField
                control={form.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="localhost" {...field} />
                    </FormControl>
                    <FormDescription>
                      MQTT broker hostname
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>port</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="1883" {...field} onChange={(e) => {
                        const value = e.target.value;
                        const onlyNumberRegex = new RegExp(/^[0-9]*$/);
                        if (onlyNumberRegex.test(value)) {
                          field.onChange(Number(value));
                        }
                      }} />
                    </FormControl>
                    <FormDescription>
                      MQTT broker port
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="mtls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>client cert</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-5" style={{ display: watchMtlsTogle == false ? 'none' : '' }}>
              <FormField
                control={form.control}
                name="clientcertfilepath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>cert file</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientkeyfilepath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>key file</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="password_auth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Password Auth</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-5" style={{ display: watchAuthTogle == false ? 'none' : '' }}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>username</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      mqtt username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>password</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormDescription>
                      mqtt auth password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-3">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>client id</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormMessage />
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="submit">Save</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}