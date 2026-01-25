use std::sync::Mutex;

use tauri::{
    menu::{MenuBuilder, MenuItem, SubmenuBuilder},
    AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder, Wry,
};
use tauri_plugin_dialog::DialogExt;

struct AppState {
    project_details: ProjectDetails,
    menu_items: MenuItems,
}

#[derive(Clone)]
struct MenuItems {
    save: MenuItem<Wry>,
    save_as: MenuItem<Wry>,
}

struct ProjectDetails {
    name: Option<String>,
    path: Option<String>,
}

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
async fn open_editor_window(
    app: AppHandle,
    state: tauri::State<'_, Mutex<AppState>>,
    project_name: String,
    project_path: String,
) -> tauri::Result<()> {
    let mut state = state.lock().unwrap();

    state.project_details.name = Some(project_name);
    state.project_details.path = Some(project_path);

    match app.webview_windows().get("editor") {
        None => {
            WebviewWindowBuilder::new(&app, "editor", WebviewUrl::App("/editor".into()))
                .title(
                    state
                        .project_details
                        .name
                        .as_ref()
                        .map(|name| format!("{} – Frost Editor", name))
                        .unwrap_or_else(|| "Frost Editor".to_string()),
                )
                .inner_size(800.0, 600.0)
                .min_inner_size(600.0, 400.0)
                .maximized(true)
                .decorations(if cfg!(windows) { false } else { true })
                .theme(Some(tauri::Theme::Dark))
                .build()?;

            state.menu_items.save.set_enabled(true)?;
            state.menu_items.save_as.set_enabled(true)?;
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

#[tauri::command]
async fn request_project_details(
    state: tauri::State<'_, Mutex<AppState>>,
) -> tauri::Result<(Option<String>, Option<String>)> {
    let state = state.lock().unwrap();

    Ok((
        state.project_details.name.clone(),
        state.project_details.path.clone(),
    ))
}

#[tauri::command]
async fn save_file_as(app: AppHandle, data: String) -> tauri::Result<()> {
    app.dialog()
        .file()
        .set_file_name("untitled.fr")
        .set_title("Save Project As")
        .add_filter("Frost Files", &["fr"])
        .save_file(move |file| {
            if let Some(path) = file {
                let file_path = path.to_string();

                match std::fs::write(&file_path, &data) {
                    Ok(_) => {
                        println!("File saved to {:?}", path);
                    }
                    Err(e) => {
                        println!("Failed to save file: {}", e);
                        let _ = app
                            .dialog()
                            .message(&format!("Failed to save file: {}", e))
                            .title("Error")
                            .kind(tauri_plugin_dialog::MessageDialogKind::Error)
                            .show(|_| {});
                    }
                }
            }
        });

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
            close_window,
            request_project_details,
            save_file_as
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

            app.manage(Mutex::new(AppState {
                menu_items: MenuItems {
                    save: save_item.clone(),
                    save_as: save_as_item.clone(),
                },
                project_details: ProjectDetails {
                    name: None,
                    path: None,
                },
            }));

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

            let cut_node_item = MenuItem::with_id(app, "cut", "Cut Node", true, Some("CMD+X"))?;
            let copy_node_item = MenuItem::with_id(app, "copy", "Copy Node", true, Some("CMD+C"))?;
            let paste_node_item =
                MenuItem::with_id(app, "paste", "Paste Node", true, Some("CMD+V"))?;
            let select_all_nodes_item =
                MenuItem::with_id(app, "select_all", "Select All Nodes", true, Some("CMD+A"))?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .separator()
                .item(&cut_node_item)
                .item(&copy_node_item)
                .item(&paste_node_item)
                .item(&select_all_nodes_item)
                .build()?;

            let window_menu = SubmenuBuilder::new(app, "Window").minimize().build()?;

            let menu = MenuBuilder::new(app)
                .items(&[&about_menu, &file_menu, &edit_menu, &window_menu])
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app: &AppHandle, event| match event.id().0.as_str() {
                "new_project" => {
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = open_new_project_window(app_handle).await;
                    });
                }
                "open_project" => {
                    app.dialog().file().pick_file(|file_path| {
                        if let Some(path) = file_path {
                            println!("Selected file: {:?}", path);
                            // Here you can add logic to open the project file
                        } else {
                            println!("No file selected");
                        }
                    });
                }
                "save_as" => {
                    app.emit("save-as-requested", ()).unwrap();
                }
                "cut" | "copy" | "paste" | "select_all" => {
                    app.emit(format!("editor-{}", event.id().0).as_str(), ())
                        .unwrap();
                }
                _ => {
                    println!("Unhandled menu item: {}", event.id().0);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
