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


enum MQTTProtocol {
  TCP = "tcp://",
  TLS = "ssl://",
}

enum MQTTAuthType {
  None,
  Password,
  ClientCert,
}

enum MQTTVersion {
  Auto = 0,
  V3,
  V3_1,
  V3_1_1,
  V5,
}

const formSchema = z.object({
  port: z.number().positive().max(65535, {
    message: "Port range is in 1-65535.",
  }),
  hostname: z.string(),
  protocol: z.nativeEnum(MQTTProtocol),
  mqtt_version: z.nativeEnum(MQTTVersion),
  auth_type: z.nativeEnum(MQTTAuthType),
  password_auth: z.boolean(),
  username: z.string(),
  password: z.string(),
  clientcertfilepath: z.string(),
  clientkeyfilepath: z.string(),
  mtls: z.boolean(),
  client_id: z.string(),
})

function startConnect(url: String) {
  invoke('start_connect', { url })
}

export function ProfileForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const url = 'tcp://' + values.hostname + ':' + String(values.port)
    startConnect(url);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <FormField
          control={form.control}
          name="mtls"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Use client cert</FormLabel>
                <FormDescription>
                  mutual tls using Client cert
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div style={{ display: watchMtlsTogle == false ? 'none' : '' }}>
          <FormField
            control={form.control}
            name="clientcertfilepath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>cert file</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>
                  cert file
                </FormDescription>
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
                <FormDescription>
                  private key file
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <FormField
          control={form.control}
          name="password_auth"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-0.5">
                <FormLabel>Use Password Auth</FormLabel>
                <FormDescription>
                  Use password auth
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div style={{ display: watchAuthTogle == false ? 'none' : '' }}>
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
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>client id</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>
                MQTT client id
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Connect</Button>
      </form>
    </Form>
  )
}