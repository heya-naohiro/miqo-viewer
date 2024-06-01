import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from '@tauri-apps/api/event'
import "./App.css";

type Packet = {
  topic: string,
  data: string,
}


function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [packet, setPacket] = useState<Array<Packet>>([]);
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }
  function executeCommands() {
    invoke('my_custom_command')
  }
  function emitMessage() {
    emit('front-to-back', "hello from front")
  }
  useEffect(() => {
    let unlisten: any;
    async function f() {
      unlisten = await listen<Packet>('mqtt-packet-recieve', event => {
        console.log(`back-to-front ${event.payload} ${new Date()}`)
        setPacket([...packet, event.payload]);
      });

    }
    f();

    return () => {
      if (unlisten) {
        unlisten();
      }
    }
  }, [])

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
      <div>Hello tauri</div>
      <button onClick={executeCommands}>Click to execute command</button>
      <button onClick={emitMessage}>Stop</button>
    </div>
  );
}

export default App;
