use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, Position, PhysicalPosition, PhysicalSize};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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

            // Hide on blur
            let main_window_clone = main_window.clone();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    main_window_clone.hide().unwrap();
                }
            });

            // Set up tray icon
            let app_handle = app.handle().clone();
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click { rect, .. } = event {
                        let window = app_handle.get_webview_window("main").unwrap();
                        let is_visible = window.is_visible().unwrap_or(false);
                        if is_visible {
                            window.hide().unwrap();
                        } else {
                            // Safely extract coordinates from Physical/Logical variants
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
