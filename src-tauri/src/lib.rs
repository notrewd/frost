use tauri::{
    menu::{MenuBuilder, MenuItem, SubmenuBuilder},
    AppHandle, Manager, WebviewUrl, WebviewWindowBuilder,
};

// for some reason, when creating a new window, the function needs to be async, otherwise the whole applications freezes up
#[tauri::command]
async fn open_new_project_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("new-project") {
        None => {
            WebviewWindowBuilder::new(&app, "new-project", WebviewUrl::App("/new-project".into()))
                .title("Create new project")
                .always_on_top(true)
                .inner_size(400.0, 600.0)
                .min_inner_size(400.0, 600.0)
                .minimizable(false)
                .maximizable(false)
                .decorations(if cfg!(windows) { false } else { true })
                .theme(Some(tauri::Theme::Dark))
                .build()?;
        }
        Some(window) => {
            window.set_focus()?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn open_welcome_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("welcome") {
        None => {
            WebviewWindowBuilder::new(&app, "welcome", WebviewUrl::App("/".into()))
                .title("Frost")
                .inner_size(800.0, 600.0)
                .min_inner_size(400.0, 300.0)
                .decorations(if cfg!(windows) { false } else { true })
                .theme(Some(tauri::Theme::Dark))
                .build()?;
        }
        Some(window) => {
            window.set_focus()?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn open_editor_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("editor") {
        None => {
            WebviewWindowBuilder::new(&app, "editor", WebviewUrl::App("/editor".into()))
                .title("Frost Editor")
                .inner_size(800.0, 600.0)
                .min_inner_size(600.0, 400.0)
                .maximized(true)
                .decorations(if cfg!(windows) { false } else { true })
                .theme(Some(tauri::Theme::Dark))
                .build()?;
        }
        Some(window) => {
            window.set_focus()?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn close_window(app: AppHandle, label: String) -> tauri::Result<()> {
    if let Some(window) = app.webview_windows().get(&label) {
        window.close()?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_new_project_window,
            open_editor_window,
            open_welcome_window,
            close_window
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let _ = open_welcome_window(handle).await;
            });

            let about_menu = SubmenuBuilder::new(app, "About")
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let new_project_item =
                MenuItem::with_id(app, "new_project", "New Project", true, Some("CMD+N"))?;
            let open_project_item =
                MenuItem::with_id(app, "open_project", "Open Project...", true, Some("CMD+O"))?;
            let save_item = MenuItem::with_id(app, "save", "Save", false, Some("CMD+S"))?;
            let save_as_item =
                MenuItem::with_id(app, "save_as", "Save As...", false, Some("CMD+SHIFT+S"))?;

            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&new_project_item)
                .separator()
                .item(&open_project_item)
                .separator()
                .item(&save_item)
                .item(&save_as_item)
                .separator()
                .close_window()
                .build()?;

            let window_menu = SubmenuBuilder::new(app, "Window").minimize().build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&about_menu, &file_menu, &window_menu])
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
