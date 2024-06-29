import { z } from "zod"
import { appConfigDir } from '@tauri-apps/api/path';
import { readDir, writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs';
import path from "path";
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
  createConfDir();
  let contents = JSON.stringify(c);
  try {
    await writeTextFile({ path: path.join('clientconfigs', c.name + '.json'), contents: contents }, { dir: BaseDirectory.AppData });
    alert('Success');
  } catch (e) {
    alert(e);
  }
}

/*
export async function loadClientConfig(name: string) {
  const appConfigDirPath = await appConfigDir();
  const validConfig: ClientConfig = clientConfigSchema.parse(JSON.parse(fs.readFileSync(path.join(appConfigDirPath, name + '.mqttconfig.json'), 'utf8')));
  return validConfig;
}
  */

async function createConfDir() {
  const a = await exists('clientconfigs', { dir: BaseDirectory.AppData });
  if (!a) {
    const res = await createDir('clientconfigs', { dir: BaseDirectory.AppData, recursive: true });
    console.log(res);
  }
}


export async function listClientConfig() {
  createConfDir();
  const filenames = await readDir('clientconfigs', { dir: BaseDirectory.AppData, recursive: false });
  return filenames.map((d) => d.name ? d.name : '');
  /*
  return filenames.filter(function (filename) {
    filename.name?.endsWith('.mqttconfig.json')
  }).map((d) => d.name?.substring(0, d.name?.length - '.mqttconfig.json'.length));
  */
}
