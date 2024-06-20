import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from '@tauri-apps/api/event'
import "./App.css";
import { Packet, DataTable } from "./components/packet-data-table";
import { ColumnDef } from "@tanstack/react-table"
import { ProfileForm, ClientConfig } from "./components/client-config-form";

export const columns: ColumnDef<Packet>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "topic",
    header: "Topic",
  },
  {
    accessorKey: "payload",
    header: "Payload",
  }
]


function App() {
  const [packets, setPacket] = useState<Array<Packet>>([]);
  const [clientConfigs, setClientConfigs] = useState<Array<ClientConfig>>([]);
  function startConnect() {
    invoke('start_connect', { host: 'mqtt://localhost:1883' })
  }
  function emitMessage() {
    emit('front-to-back', 'stop payload')
  }
  useEffect(() => {
    const unlisten = listen<Packet>('mqtt-packet-recieve', event => {
      console.log(`back-to-front ${event.payload} ${new Date()}`)
      setPacket(oldarray => [event.payload, ...oldarray]);
    });
    return () => {
      unlisten.then(f => f())
    }
  }, [])

  return (
    <div className="container">
      <h1>Welcome to Miqo topic!</h1>
      <ProfileForm />
      <p>{packets.length}</p>
      <div>Hello tauri</div>
      <button onClick={startConnect}>Connect</button>
      <button onClick={emitMessage}>Stop</button>
      <DataTable columns={columns} data={packets} />
    </div>
  );
}

export default App;
