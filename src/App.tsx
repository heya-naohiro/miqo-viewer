import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from '@tauri-apps/api/event'
import "./App.css";

type Packet = {
  topic: string,
  payload: string,
  timestamp: number,
}


function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [packets, setPacket] = useState<Array<Packet>>([]);
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }
  function executeCommands() {
    invoke('my_custom_command', { host: 'mqtt://localhost:1883' })
  }
  function emitMessage() {
    emit('front-to-back', 'stop payload')
  }
  useEffect(() => {
    const unlisten = listen<Packet>('mqtt-packet-recieve', event => {
      console.log(`back-to-front ${event.payload} ${new Date()}`)
      setPacket(oldarray => [event.payload, ...oldarray]);
    });
    /*
    let unlisten: any;
    async function f() {
      unlisten = await listen<Packet>('mqtt-packet-recieve', event => {
        console.log(`back-to-front ${event.payload} ${new Date()}`)
        setPacket(oldarray => [event.payload, ...oldarray]);
      });

    }
    f();

    return () => {
      if (unlisten) {
        unlisten();
      }
    }
    */
    return () => {
      unlisten.then(f => f())
    }
  }, [])

  return (
    <div className="container">
      <h1>Welcome to Miqo topic!</h1>


      <p>{packets.length}</p>
      <div>Hello tauri</div>
      <button onClick={executeCommands}>Start</button>
      <button onClick={emitMessage}>Stop</button>
      <table>
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            <th scope="col">Topic</th>
            <th scope="col">Payload</th>
          </tr>
        </thead>
        <tbody>
          {packets.map((packet) => {
            return (
              <tr key={packet.timestamp}>
                <td>{packet.timestamp}</td>
                <td>{packet.topic}</td>
                <td>{packet.payload}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
