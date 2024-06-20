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
import { Input } from "@/components/ui/input"

export type ClientConfig = {
  host: string,
  port: number,
  protocol: MQTTProtocol,
  authtype: MQTTAuthType,
  client_id?: string,
  mqtt_version?: MQTTVersion,
  SubscribeTopic?: string,
  mtls?: mtlsConfig
}

type mtlsConfig = {
  publickeypath: string,
  privatekeypath: string,
  keyformat: string,
}

enum MQTTProtocol {
  TCP,
  TLS,
  Websocket,
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
})

function startConnect(host: String) {
  invoke('start_connect', { host })
}

export function ProfileForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostname: "",
      port: 1883,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // send config event to backend
    const url = 'mqtt://' + values.hostname + ':' + String(values.port)
    startConnect(url);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <Button type="submit">Connect</Button>
      </form>
    </Form>
  )
}