#![allow(unexpected_cfgs)]
use std::process::Child;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButtonState};
use tauri::{Manager, PhysicalPosition, PhysicalSize, Position};


pub struct AppState {
    pub caffeine_child: Mutex<Option<Child>>,
    pub last_show_time: Mutex<Option<Instant>>,
    pub cursor_highlight_active: Mutex<bool>,
    pub cursor_tap_stop: Mutex<Option<Arc<AtomicBool>>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            caffeine_child: Mutex::new(None),
            last_show_time: Mutex::new(None),
            cursor_highlight_active: Mutex::new(false),
            cursor_tap_stop: Mutex::new(None),
        }
    }
}

impl Drop for AppState {
    fn drop(&mut self) {
        let mut guard = self.caffeine_child.lock().unwrap();
        if let Some(mut child) = guard.take() {
            let _ = child.kill();
        }
        if let Some(stop) = self.cursor_tap_stop.lock().unwrap().take() {
            stop.store(true, Ordering::Relaxed);
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


#[derive(Clone, serde::Serialize)]
struct CursorMovePayload {
    x: f64,
    y: f64,
    clicked: bool,
}

#[tauri::command]
fn get_cursor_highlight(state: tauri::State<'_, AppState>) -> bool {
    *state.cursor_highlight_active.lock().unwrap()
}



lazy_static::lazy_static! {
    static ref MAGNIFIER_ACTIVE: AtomicBool = AtomicBool::new(false);
    static ref MAGNIFIER_X: Mutex<f64> = Mutex::new(0.0);
    static ref MAGNIFIER_Y: Mutex<f64> = Mutex::new(0.0);
    static ref MAGNIFIER_SIZE: Mutex<f64> = Mutex::new(200.0);
    static ref LATEST_BASE64: Mutex<Option<String>> = Mutex::new(None);
    static ref LAST_REQUEST: Mutex<std::time::Instant> = Mutex::new(std::time::Instant::now());
}

#[tauri::command]
fn get_magnifier_image(x: f64, y: f64, size: f64) -> Result<String, String> {
    if let Ok(mut mx) = MAGNIFIER_X.lock() { *mx = x; }
    if let Ok(mut my) = MAGNIFIER_Y.lock() { *my = y; }
    if let Ok(mut msize) = MAGNIFIER_SIZE.lock() { *msize = size; }
    if let Ok(mut last) = LAST_REQUEST.lock() { *last = std::time::Instant::now(); }
    
    MAGNIFIER_ACTIVE.store(true, Ordering::SeqCst);

    if let Ok(latest) = LATEST_BASE64.lock() {
        if let Some(b64) = latest.as_ref() {
            return Ok(b64.clone());
        }
    }
    Err("No frame yet".into())
}

#[tauri::command]
fn toggle_cursor_highlight(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    active: bool,
) -> Result<(), String> {
    let mut is_active = state.cursor_highlight_active.lock().unwrap();

    if active && !*is_active {
        // Create overlay window
        let overlay = create_cursor_overlay(&app_handle)?;

        // Configure macOS-specific overlay properties
        #[cfg(target_os = "macos")]
        configure_overlay_macos(&overlay);

        let _ = overlay.show();

        // Start mouse tracking thread
        let stop_flag = Arc::new(AtomicBool::new(false));
        let stop_clone = stop_flag.clone();
        let handle_clone = app_handle.clone();

        thread::spawn(move || {
            use core_graphics::event::CGEvent;
            use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
            use tauri::Emitter;

            // CGEventSourceButtonState is not wrapped in core-graphics 0.24,
            // so we call the CoreGraphics C function directly via FFI.
            extern "C" {
                fn CGEventSourceButtonState(
                    state_id: u32,
                    button: u32,
                ) -> bool;
            }

            let mut prev_left = false;
            let mut last_x: f64 = -1.0;
            let mut last_y: f64 = -1.0;

            loop {
                if stop_clone.load(Ordering::Relaxed) {
                    break;
                }

                let source_state = CGEventSourceStateID::CombinedSessionState;

                if let Ok(source) = CGEventSource::new(source_state) {
                    if let Ok(event) = CGEvent::new(source) {
                        let pos = event.location();

                        // CombinedSessionState = 1, CGMouseButton::Left = 0
                        let left_pressed = unsafe {
                            CGEventSourceButtonState(1, 0)
                        };

                        // Detect click transition (not pressed -> pressed)
                        let just_clicked = left_pressed && !prev_left;
                        prev_left = left_pressed;

                        // Only emit if position changed or click happened
                        if (pos.x - last_x).abs() > 0.5
                            || (pos.y - last_y).abs() > 0.5
                            || just_clicked
                        {
                            last_x = pos.x;
                            last_y = pos.y;

                            let _ = handle_clone.emit(
                                "cursor-move",
                                CursorMovePayload {
                                    x: pos.x,
                                    y: pos.y,
                                    clicked: just_clicked,
                                },
                            );
                        }
                    }
                }

                thread::sleep(Duration::from_millis(8));
            }
        });

        *state.cursor_tap_stop.lock().unwrap() = Some(stop_flag);
        *is_active = true;
    } else if !active && *is_active {
        // Stop tracking thread
        if let Some(stop) = state.cursor_tap_stop.lock().unwrap().take() {
            stop.store(true, Ordering::Relaxed);
        }

        // Close overlay window
        if let Some(win) = app_handle.get_webview_window("cursor_overlay") {
            let _ = win.close();
        }

        *is_active = false;
    }

    Ok(())
}

fn create_cursor_overlay(app_handle: &tauri::AppHandle) -> Result<tauri::WebviewWindow, String> {
    // If already exists, return it
    if let Some(existing) = app_handle.get_webview_window("cursor_overlay") {
        return Ok(existing);
    }

    // Get primary monitor dimensions for window sizing
    let monitor = app_handle
        .primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("Primary monitor bulunamadı".to_string())?;
    let size = monitor.size();
    let scale = monitor.scale_factor();
    let logical_w = size.width as f64 / scale;
    let logical_h = size.height as f64 / scale;

    let overlay = tauri::WebviewWindowBuilder::new(
        app_handle,
        "cursor_overlay",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Cursor Overlay")
    .inner_size(logical_w, logical_h)
    .position(0.0, 0.0)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .visible(false)
    .skip_taskbar(true)
    .resizable(false)
    .shadow(false)
    .focusable(false)
    .build()
    .map_err(|e| format!("Overlay penceresi oluşturulamadı: {}", e))?;

    Ok(overlay)
}

#[cfg(target_os = "macos")]
fn configure_overlay_macos(window: &tauri::WebviewWindow) {
    use objc::runtime::Object;
    use objc::{msg_send, sel, sel_impl};
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};

    // Access the native NSWindow to set click-through and window level
    if let Ok(handle) = window.window_handle() {
        if let RawWindowHandle::AppKit(appkit) = handle.as_raw() {
            unsafe {
                let ns_view = appkit.ns_view.as_ptr() as *mut Object;
                let ns_window: *mut Object = msg_send![ns_view, window];

                // Make window click-through: all mouse events pass to apps below
                let _: () = msg_send![ns_window, setIgnoresMouseEvents: true];

                // Set window level above everything (NSStatusWindowLevel = 25)
                let _: () = msg_send![ns_window, setLevel: 25_i64];

                // Remove window shadow
                let _: () = msg_send![ns_window, setHasShadow: false];

                // Exclude window from screenshots to prevent magnifier feedback loop
                // NSWindowSharingNone = 0
                let _: () = msg_send![ns_window, setSharingType: 0_i64];

                // Join all spaces and be stationary (don't appear in Mission Control)
                // NSWindowCollectionBehaviorCanJoinAllSpaces = 1 << 0
                // NSWindowCollectionBehaviorStationary = 1 << 4
                let behavior: u64 = (1 << 0) | (1 << 4);
                let _: () = msg_send![ns_window, setCollectionBehavior: behavior];
            }
        }
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
            get_cursor_highlight,
            toggle_cursor_highlight,
            get_magnifier_image,
            quit_app
        ])
        .setup(|app| {
            // BACKGROUND MAGNIFIER CAPTURE THREAD
            std::thread::spawn(|| {
                use std::io::Cursor;
                use base64::{Engine as _, engine::general_purpose::STANDARD};
                #[cfg(not(target_os = "macos"))]
                let mut monitors = xcap::Monitor::all().unwrap_or_default();
                
                loop {
                    if !MAGNIFIER_ACTIVE.load(Ordering::SeqCst) {
                        std::thread::sleep(std::time::Duration::from_millis(100));
                        continue;
                    }
                    
                    if let Ok(last) = LAST_REQUEST.lock() {
                        if last.elapsed() > std::time::Duration::from_secs(1) {
                            MAGNIFIER_ACTIVE.store(false, Ordering::SeqCst);
                            continue;
                        }
                    }

                    let x = *MAGNIFIER_X.lock().unwrap_or_else(|e| e.into_inner());
                    let y = *MAGNIFIER_Y.lock().unwrap_or_else(|e| e.into_inner());
                    let size = *MAGNIFIER_SIZE.lock().unwrap_or_else(|e| e.into_inner());
                    
                    #[cfg(target_os = "macos")]
                    {
                        use core_graphics::display::{CGDisplay, CGRect, CGPoint, CGSize};
                        let display = CGDisplay::main();
                        let half_size = size / 2.0;
                        let rect_x = x - half_size;
                        let rect_y = y - half_size;
                        let rect = CGRect::new(&CGPoint::new(rect_x, rect_y), &CGSize::new(size, size));
                        
                        if let Some(cg_img) = display.image_for_rect(rect) {
                            let width = cg_img.width() as u32;
                            let height = cg_img.height() as u32;
                            let bytes_per_row = cg_img.bytes_per_row();
                            let data = cg_img.data();
                            let bytes = data.bytes();
                            
                            let mut rgba_bytes = Vec::with_capacity((width * height * 4) as usize);
                            for r_y in 0..height {
                                let row_start = (r_y as usize) * bytes_per_row;
                                for r_x in 0..width {
                                    let pixel_start = row_start + (r_x as usize) * 4;
                                    if pixel_start + 3 < bytes.len() {
                                        rgba_bytes.push(bytes[pixel_start + 2]); // R
                                        rgba_bytes.push(bytes[pixel_start + 1]); // G
                                        rgba_bytes.push(bytes[pixel_start]);     // B
                                        rgba_bytes.push(bytes[pixel_start + 3]); // A
                                    } else {
                                        rgba_bytes.extend_from_slice(&[0, 0, 0, 255]);
                                    }
                                }
                            }
                            if let Some(img) = image::RgbaImage::from_raw(width, height, rgba_bytes) {
                                let rgb_image = image::DynamicImage::ImageRgba8(img).into_rgb8();
                                let mut jpeg_bytes = Vec::new();
                                if rgb_image.write_to(&mut Cursor::new(&mut jpeg_bytes), image::ImageFormat::Jpeg).is_ok() {
                                    if let Ok(mut latest) = LATEST_BASE64.lock() {
                                        *latest = Some(STANDARD.encode(&jpeg_bytes));
                                    }
                                }
                            }
                        }
                    }

                    #[cfg(not(target_os = "macos"))]
                    {
                        if monitors.is_empty() {
                            monitors = xcap::Monitor::all().unwrap_or_default();
                        }
                        let mut target_monitor = None;
                        for m in &monitors {
                            let mx = m.x().unwrap_or(0) as f64;
                            let my = m.y().unwrap_or(0) as f64;
                            let mw = m.width().unwrap_or(0) as f64;
                            let mh = m.height().unwrap_or(0) as f64;
                            if x >= mx && x <= mx + mw && y >= my && y <= my + mh {
                                target_monitor = Some(m.clone());
                                break;
                            }
                        }

                        if let Some(monitor) = target_monitor {
                            if let Ok(image) = monitor.capture_image() {
                                let local_x = (x - monitor.x().unwrap_or(0) as f64) as u32;
                                let local_y = (y - monitor.y().unwrap_or(0) as f64) as u32;
                                
                                let mon_w = monitor.width().unwrap_or(1920).max(1) as f64;
                                let scale = image.width() as f64 / mon_w;
                                
                                let scaled_x = (local_x as f64 * scale) as u32;
                                let scaled_y = (local_y as f64 * scale) as u32;
                                let scaled_size = (size * scale) as u32;
                                let half_size = scaled_size / 2;

                                let mut crop_x = scaled_x.saturating_sub(half_size);
                                let mut crop_y = scaled_y.saturating_sub(half_size);
                                let mut crop_w = scaled_size;
                                let mut crop_h = scaled_size;

                                // Clamp bounds to prevent thread panics
                                if crop_x + crop_w > image.width() {
                                    crop_w = image.width().saturating_sub(crop_x);
                                }
                                if crop_y + crop_h > image.height() {
                                    crop_h = image.height().saturating_sub(crop_y);
                                }

                                if crop_w > 0 && crop_h > 0 {
                                    let cropped = image::imageops::crop_imm(&image, crop_x, crop_y, crop_w, crop_h).to_image();
                                    let rgb_image = image::DynamicImage::ImageRgba8(cropped).into_rgb8();
                                    let mut jpeg_bytes = Vec::new();
                                    if rgb_image.write_to(&mut Cursor::new(&mut jpeg_bytes), image::ImageFormat::Jpeg).is_ok() {
                                        if let Ok(mut latest) = LATEST_BASE64.lock() {
                                            *latest = Some(STANDARD.encode(&jpeg_bytes));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Throttle to ~60 FPS
                    std::thread::sleep(std::time::Duration::from_millis(16));
                }
            });

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
