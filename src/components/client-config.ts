import { z } from "zod"
import { appConfigDir } from '@tauri-apps/api/path';
import fs from 'fs';
import path from 'path';
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
  name: z.string(),
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
type ClientConfig = z.infer<typeof clientConfigSchema>

export async function saveClientConfig(c: ClientConfig) {
  let contents = JSON.stringify(c);
  const appConfigDirPath = await appConfigDir();
  fs.writeFile(path.join(appConfigDirPath, c.name + '.mqttconfig.json'), contents, (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log('Successfully wrote file');
    }
  })
}

export async function loadClientConfig(name: string) {
  const appConfigDirPath = await appConfigDir();
  const validConfig: ClientConfig = clientConfigSchema.parse(JSON.parse(fs.readFileSync(path.join(appConfigDirPath, name + '.mqttconfig.json'), 'utf8')));
  return validConfig;
}

export async function listClientConfig() {
  const appConfigDirPath = await appConfigDir();
  fs.readdir(appConfigDirPath, (_, filenames) => {
    return filenames.filter(function (filename) {
      filename.endsWith('.mqttconfig.json')
    }).map((str) => str.substring(0, str.length - '.mqttconfig.json'.length));
  });
}