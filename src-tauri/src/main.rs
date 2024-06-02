// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use paho_mqtt as mqtt;
use serde::{Deserialize, Serialize};
use std::str::Bytes;
use std::time::Duration;
use std::{sync::mpsc, thread::sleep, time};
use tauri::Manager;

enum Message {
    Stop,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Packet<'a> {
    payload: &'a [u8],
    topic: &'a str,
}

fn try_reconnect(cli: &mqtt::Client) -> bool {
    println!("Connection lost. Reconnecting...");
    for _ in 0..60 {
        sleep(Duration::from_secs(1));
        if cli.reconnect().is_ok() {
            println!("  Successfully reconnected");
            return true;
        }
    }
    println!("Unable to reconnect after several attempts.");
    false
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle, host: String) -> String {
    println!("Hello {}", host);
    let (tx, rx) = mpsc::channel();
    /* Stop Command handler */
    let id = app_handle.listen_global("front-to-back", move |event| {
        println!(
            "got front-to-back with payload {:?}",
            event.payload().unwrap()
        );
        let _ = tx.send(Message::Stop);
    });

    /* mqtt thread */
    tauri::async_runtime::spawn(async move {
        // Connect
        let create_opts = mqtt::CreateOptionsBuilder::new()
            .server_uri(host)
            .client_id("miqo-viewer")
            .finalize();

        let cli = match mqtt::Client::new(create_opts) {
            Ok(cli) => cli,
            Err(err) => {
                eprintln!("mqtt cli error {}", err);
                return "";
            }
        };
        println!("Hello World");
        let mqtt_rx = cli.start_consuming();

        let conn_opts = mqtt::ConnectOptionsBuilder::new()
            .keep_alive_interval(Duration::from_secs(20))
            .clean_session(false)
            .finalize();

        if let Err(err) = cli.connect(conn_opts) {
            println!("Error {}", err);
            return "Connect Error";
        }
        if let Err(err) = cli.subscribe("#", 0) {
            cli.disconnect(None).unwrap();
            println!("Error {}", err);
            return "Subscribe Error";
        }
        println!("Subscribe start");
        loop {
            match rx.try_recv() {
                Ok(Message::Stop) | Err(mpsc::TryRecvError::Disconnected) => {
                    app_handle.unlisten(id);
                    cli.stop_consuming();
                    if cli.is_connected() {
                        println!("\nDisconnecting...");
                        cli.disconnect(None).unwrap();
                    }
                    return "";
                }
                Err(mpsc::TryRecvError::Empty) => {
                    println!("Hello Empty");
                    let content = match mqtt_rx.try_recv() {
                        Ok(content) => content,
                        Err(err) => return "MQTT Message Error",
                    };
                    let message = if let Some(content) = content {
                        println!("content, {}", content);
                        content
                    } else if cli.is_connected() || !try_reconnect(&cli) {
                        return "";
                    } else {
                        continue;
                    };
                    let packet = Packet {
                        topic: message.topic(),
                        payload: message.payload(),
                    };
                    println!("mqtt-packet-recieve {:?}", packet);
                    app_handle.emit_all("mqtt-packet-recieve", packet).unwrap();
                }
            }
        }
    });
    println!("stop");

    "End".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn simple_command() {
    println!("I was invoked from JS!");
}

#[tauri::command]
fn command_with_message(message: String) -> String {
    format!("hello {}", message)
}
