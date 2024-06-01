// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{sync::mpsc, thread::sleep, time};
use tauri::Manager;
enum Message {
    Stop,
}
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn my_custom_command(app_handle: tauri::AppHandle) -> String {
    let (tx, rx) = mpsc::channel();

    let id = app_handle.listen_global("front-to-back", move |event| {
        println!(
            "got front-to-back with payload {:?}",
            event.payload().unwrap()
        );
        let _ = tx.send(Message::Stop);
    });
    tauri::async_runtime::spawn(async move {
        let mut i = 0;
        loop {
            match rx.try_recv() {
                Ok(Message::Stop) | Err(mpsc::TryRecvError::Disconnected) => {
                    app_handle.unlisten(id);
                    break;
                }
                Err(mpsc::TryRecvError::Empty) => {
                    app_handle
                        .emit_all("mqtt-packet-recieve", "ping frontend".to_string())
                        .unwrap();
                    println!("emit all {}", i);
                    i = i + 1;
                    sleep(time::Duration::from_millis(1000));
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
