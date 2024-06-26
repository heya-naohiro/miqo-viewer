import { z } from "zod"

export enum MQTTProtocol {
  TCP = "tcp://",
  TLS = "ssl://",
}

export enum MQTTAuthType {
  None,
  Password,
  ClientCert,
}

export enum MQTTVersion {
  Auto = 0,
  V3,
  V3_1,
  V3_1_1,
  V5,
}

export const clientConfigSchema = z.object({
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
