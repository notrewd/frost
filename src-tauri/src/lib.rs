use std::sync::Mutex;

use tauri::{
    menu::{MenuBuilder, MenuEvent, MenuItem, SubmenuBuilder},
    AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder, Wry,
};
use tauri_plugin_dialog::DialogExt;

use crate::util::RecentProject;

mod util;

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

#[derive(serde::Serialize, Clone)]
struct ProjectOpenedEvent {
    name: String,
    path: String,
    data: Option<String>,
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
    project_data: Option<String>,
) -> tauri::Result<()> {
    let mut state = state.lock().unwrap();

    state.project_details.name = Some(project_name.clone());
    state.project_details.path = Some(project_path.clone());

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
            window.set_title(&format!("{} – Frost Editor", project_name))?;
            window.set_focus()?;
        }
    }

    let event = ProjectOpenedEvent {
        name: state.project_details.name.clone().unwrap_or_default(),
        path: state.project_details.path.clone().unwrap_or_default(),
        data: project_data,
    };

    app.emit_to("editor", "project-opened", event)?;

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
async fn request_project_data(
    state: tauri::State<'_, Mutex<AppState>>,
) -> tauri::Result<Option<String>> {
    let state = state.lock().unwrap();
    let path = state.project_details.path.clone();

    if let Some(path) = path {
        match std::fs::read_to_string(&path) {
            Ok(data) => Ok(Some(data)),
            Err(_) => Ok(None),
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn save_file(state: tauri::State<'_, Mutex<AppState>>, data: String) -> tauri::Result<()> {
    let state = state.lock().unwrap();
    let name = state
        .project_details
        .name
        .clone()
        .unwrap_or_else(|| "untitled".to_string());
    let path = state.project_details.path.clone();

    if let Some(path) = &path {
        match std::fs::write(&path, &data) {
            Ok(_) => {
                println!("File saved to {:?}", path);
            }
            Err(e) => {
                println!("Failed to save file: {}", e);
            }
        }

        util::add_recent_project(RecentProject::new(name, path.clone()));
    }

    Ok(())
}

#[tauri::command]
async fn save_file_as(app: AppHandle, data: String) -> tauri::Result<()> {
    let file_path = app
        .dialog()
        .file()
        .set_file_name("untitled.fr")
        .set_title("Save Project As")
        .add_filter("Frost Files", &["fr"])
        .blocking_save_file();

    if let Some(path) = file_path {
        let file_path = path.to_string();

        match std::fs::write(&file_path, &data) {
            Ok(_) => {
                println!("File saved to {:?}", path);

                let project_data = util::get_project_data_from_path(&file_path)?;

                let app_handle = app.clone();
                let state = app_handle.state::<Mutex<AppState>>().clone();
                let app_handle = app.clone();

                util::add_recent_project(RecentProject::new(
                    project_data.name.clone(),
                    file_path.clone(),
                ));

                open_editor_window(
                    app_handle,
                    state,
                    project_data.name,
                    project_data.path,
                    Some(project_data.content),
                )
                .await
                .unwrap();
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

    Ok(())
}

#[tauri::command]
async fn open_project_path(app: AppHandle, path: String) -> Result<(), String> {
    let data = util::get_project_data_from_path(&path);

    if data.is_err() {
        app.dialog()
            .message(&format!(
                "Failed to open project at path: {}\n\nError: {}",
                path,
                data.err().unwrap()
            ))
            .title("Error")
            .kind(tauri_plugin_dialog::MessageDialogKind::Error)
            .show(|_| {});

        return Err("Failed to open project".to_string());
    }

    let data = data.unwrap();

    let app_handle = app.clone();
    let state = app_handle.state::<Mutex<AppState>>().clone();
    let app_handle = app.clone();

    util::add_recent_project(RecentProject::new(data.name.clone(), data.path.clone()));

    open_editor_window(app_handle, state, data.name, data.path, Some(data.content))
        .await
        .unwrap();

    Ok(())
}

#[tauri::command]
async fn open_project_file(app: AppHandle) -> Result<(), String> {
    let file_path = app
        .dialog()
        .file()
        .add_filter("Frost Files", &["fr"])
        .set_title("Open Project")
        .blocking_pick_file();

    if let Some(path) = file_path {
        open_project_path(app, path.to_string()).await
    } else {
        Err("No file selected".to_string())
    }
}

#[tauri::command]
async fn get_recent_projects() -> Vec<util::RecentProject> {
    util::get_recent_projects()
}

#[tauri::command]
async fn clear_recent_projects() {
    util::clear_recent_projects();
}

#[tauri::command]
async fn remove_recent_project(path: String) {
    util::remove_recent_project(&path);
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
            request_project_data,
            save_file,
            save_file_as,
            open_project_file,
            open_project_path,
            get_recent_projects,
            clear_recent_projects,
            remove_recent_project
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

            app.on_menu_event(move |app: &AppHandle, event: MenuEvent| {
                match event.id().0.as_str() {
                    "new_project" => {
                        app.emit("editor-new-project", ()).unwrap();
                    }
                    "open_project" => {
                        app.emit("editor-open-project", ()).unwrap();
                    }
                    "save" => {
                        app.emit("save-requested", ()).unwrap();
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
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
