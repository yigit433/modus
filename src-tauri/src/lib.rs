use std::process::Child;
use std::sync::Mutex;
use std::time::Instant;
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButtonState};
use tauri::{Manager, PhysicalPosition, PhysicalSize, Position};

pub struct AppState {
    pub caffeine_child: Mutex<Option<Child>>,
    pub last_show_time: Mutex<Option<Instant>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            caffeine_child: Mutex::new(None),
            last_show_time: Mutex::new(None),
        }
    }
}

impl Drop for AppState {
    fn drop(&mut self) {
        let mut guard = self.caffeine_child.lock().unwrap();
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
        }
    }
}

// --- COMMANDS ---

#[tauri::command]
fn get_dark_mode() -> bool {
    let output = std::process::Command::new("defaults")
        .args(&["read", "-g", "AppleInterfaceStyle"])
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        stdout.trim() == "Dark"
    } else {
        false
    }
}

#[tauri::command]
fn set_dark_mode(dark: bool) -> Result<(), String> {
    let mode_str = if dark { "true" } else { "false" };
    let script = format!(
        "tell application \"System Events\" to tell appearance preferences to set dark mode to {}",
        mode_str
    );
    let status = std::process::Command::new("osascript")
        .args(&["-e", &script])
        .status();

    match status {
        Ok(s) if s.success() => Ok(()),
        _ => Err("Karanlık mod değiştirilemedi".into()),
    }
}

#[tauri::command]
fn get_caffeine(state: tauri::State<'_, AppState>) -> bool {
    let guard = state.caffeine_child.lock().unwrap();
    guard.is_some()
}

#[tauri::command]
fn set_caffeine(state: tauri::State<'_, AppState>, active: bool) -> Result<(), String> {
    let mut guard = state.caffeine_child.lock().unwrap();
    if active {
        if guard.is_none() {
            let child = std::process::Command::new("caffeinate")
                .args(&["-d"]) // keeps display awake
                .spawn();
            match child {
                Ok(c) => {
                    *guard = Some(c);
                    Ok(())
                }
                Err(e) => Err(format!("Caffeinate başlatılamadı: {}", e)),
            }
        } else {
            Ok(())
        }
    } else {
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
        }
        Ok(())
    }
}

#[tauri::command]
fn get_desktop_icons() -> bool {
    let output = std::process::Command::new("defaults")
        .args(&["read", "com.apple.finder", "CreateDesktop"])
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        let val = stdout.trim();
        val != "false" && val != "0"
    } else {
        true
    }
}

#[tauri::command]
fn set_desktop_icons(show: bool) -> Result<(), String> {
    let val = if show { "true" } else { "false" };
    let status1 = std::process::Command::new("defaults")
        .args(&["write", "com.apple.finder", "CreateDesktop", val])
        .status();

    let status2 = std::process::Command::new("killall")
        .arg("Finder")
        .status();

    match (status1, status2) {
        (Ok(s1), Ok(s2)) if s1.success() && s2.success() => Ok(()),
        _ => Err("Masaüstü simgeleri durumu değiştirilemedi".into()),
    }
}

#[tauri::command]
fn get_mute() -> bool {
    let output = std::process::Command::new("osascript")
        .args(&["-e", "output muted of (get volume settings)"])
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        stdout.trim() == "true"
    } else {
        false
    }
}

#[tauri::command]
fn set_mute(mute: bool) -> Result<(), String> {
    let mode_str = if mute { "with" } else { "without" };
    let script = format!("set volume {} output muted", mode_str);
    let status = std::process::Command::new("osascript")
        .args(&["-e", &script])
        .status();

    match status {
        Ok(s) if s.success() => Ok(()),
        _ => Err("Ses durumu değiştirilemedi".into()),
    }
}

#[tauri::command]
fn start_screensaver() -> Result<(), String> {
    let status = std::process::Command::new("open")
        .args(&["-a", "ScreenSaverEngine"])
        .status();

    match status {
        Ok(s) if s.success() => Ok(()),
        _ => Err("Ekran koruyucu başlatılamadı".into()),
    }
}

#[tauri::command]
fn empty_trash() -> Result<(), String> {
    let status = std::process::Command::new("osascript")
        .args(&["-e", "tell application \"Finder\" to empty trash"])
        .status();

    match status {
        Ok(s) if s.success() => Ok(()),
        _ => Err("Çöp sepeti boşaltılamadı".into()),
    }
}

#[tauri::command]
fn open_cleaner_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    // If the cleaner window is already open, focus it and return
    if let Some(existing) = app_handle.get_webview_window("cleaner") {
        let _ = existing.show();
        let _ = existing.set_focus();
        return Ok(());
    }

    // Create a new window that is fullscreen, borderless, always on top
    let cleaner_window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        "cleaner",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Modus Keyboard Cleaner")
    .fullscreen(true)
    .decorations(false)
    .always_on_top(true)
    .visible(false)
    .build();

    match cleaner_window {
        Ok(w) => {
            let _ = w.show();
            let _ = w.set_focus();
            Ok(())
        }
        Err(e) => Err(format!("Klavye temizleme ekranı açılamadı: {}", e)),
    }
}

#[tauri::command]
fn close_cleaner_window(app_handle: tauri::AppHandle) {
    if let Some(window) = app_handle.get_webview_window("cleaner") {
        let _ = window.close();
    }
}

#[tauri::command]
fn quit_app(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

// --- MAIN RUN ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_dark_mode,
            set_dark_mode,
            get_caffeine,
            set_caffeine,
            get_desktop_icons,
            set_desktop_icons,
            get_mute,
            set_mute,
            start_screensaver,
            empty_trash,
            open_cleaner_window,
            close_cleaner_window,
            quit_app
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let main_window = app.get_webview_window("main").unwrap();

            // Apply macOS vibrancy for that premium look
            #[cfg(target_os = "macos")]
            window_vibrancy::apply_vibrancy(
                &main_window,
                window_vibrancy::NSVisualEffectMaterial::HudWindow,
                None,
                None,
            )
            .expect("Failed to apply vibrancy");

            // Hide on blur (with a safety threshold to prevent closing on startup/drag)
            let main_window_clone = main_window.clone();
            let app_handle_clone = app.handle().clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(focused) = event {
                    if !focused {
                        let last_show = {
                            let state = app_handle_clone.state::<AppState>();
                            let guard = state.last_show_time.lock().unwrap();
                            *guard
                        };
                        let should_hide = match last_show {
                            Some(time) => time.elapsed().as_millis() > 300,
                            None => true,
                        };
                        if should_hide {
                            main_window_clone.hide().unwrap();
                        }
                    }
                }
            });

            // Set up tray icon
            let app_handle = app.handle().clone();
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click { rect, button_state, .. } = event {
                        // Crucial: Only react to MouseDown to toggle the window instantly.
                        // If we don't filter, MouseUp will trigger a second event which immediately hides the window!
                        if button_state == MouseButtonState::Up {
                            return;
                        }

                        let window = app_handle.get_webview_window("main").unwrap();
                        let is_visible = window.is_visible().unwrap_or(false);
                        if is_visible {
                            window.hide().unwrap();
                        } else {
                            // Update the last show time
                            *app_handle.state::<AppState>().last_show_time.lock().unwrap() = Some(Instant::now());

                            // Calculate position below the tray icon
                            let (tray_x, tray_y) = match rect.position {
                                Position::Physical(p) => (p.x as f64, p.y as f64),
                                Position::Logical(l) => (l.x, l.y),
                            };
                            let (tray_w, tray_h) = match rect.size {
                                tauri::Size::Physical(s) => (s.width as f64, s.height as f64),
                                tauri::Size::Logical(l) => (l.width, l.height),
                            };

                            let win_size = window.outer_size().unwrap_or(PhysicalSize::new(340, 480));
                            let win_w = win_size.width as f64;

                            // Center horizontally under the tray icon
                            let x = tray_x + (tray_w / 2.0) - (win_w / 2.0);
                            let y = tray_y + tray_h;

                            window
                                .set_position(Position::Physical(PhysicalPosition::new(x as i32, y as i32)))
                                .unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
