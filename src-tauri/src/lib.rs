use base64::prelude::*;
use std::sync::Mutex;

use tauri::{
    menu::{MenuBuilder, MenuEvent, MenuItem, SubmenuBuilder},
    AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder, Wry,
};
use tauri_plugin_dialog::DialogExt;

use crate::util::RecentProject;

mod generator;
mod util;

struct AppState {
    project_details: ProjectDetails,
    menu_items: MenuItems,
    settings: SettingsState,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(default)]
struct SettingsState {
    theme: String,
    pan_on_scroll: bool,
    show_minimap: bool,
    colored_nodes: bool,
    show_controls: bool,
    edge_style: String,

    // General
    auto_save: bool,
    auto_save_interval: u32,

    // Editor
    show_grid: bool,
    snap_to_grid: bool,
    grid_size: u32,

    // Nodes
    compact_nodes: bool,
    object_node_access_modifier_color_light: String,
    object_node_access_modifier_color_dark: String,
    object_node_type_separator_color_light: String,
    object_node_type_separator_color_dark: String,
    object_node_type_color_light: String,
    object_node_type_color_dark: String,
    object_node_default_value_color_light: String,
    object_node_default_value_color_dark: String,
    object_node_parameter_name_color_light: String,
    object_node_parameter_name_color_dark: String,
    node_border_radius: u32,

    // Edges
    show_edge_labels: bool,
}

impl Default for SettingsState {
    fn default() -> Self {
        Self {
            theme: "dark".to_string(),
            pan_on_scroll: false,
            show_minimap: true,
            colored_nodes: true,
            show_controls: true,
            edge_style: "bezier".to_string(),
            auto_save: false,
            auto_save_interval: 5,
            show_grid: true,
            snap_to_grid: false,
            grid_size: 15,
            compact_nodes: false,
            object_node_access_modifier_color_light: "#16a34a".to_string(),
            object_node_access_modifier_color_dark: "#4ade80".to_string(),
            object_node_type_separator_color_light: "#dc2626".to_string(),
            object_node_type_separator_color_dark: "#f87171".to_string(),
            object_node_type_color_light: "#2563eb".to_string(),
            object_node_type_color_dark: "#60a5fa".to_string(),
            object_node_default_value_color_light: "#9333ea".to_string(),
            object_node_default_value_color_dark: "#c084fc".to_string(),
            object_node_parameter_name_color_light: "#ea580c".to_string(),
            object_node_parameter_name_color_dark: "#fb923c".to_string(),
            node_border_radius: 8,
            show_edge_labels: true,
        }
    }
}

#[derive(Clone)]
struct MenuItems {
    save: MenuItem<Wry>,
    save_as: MenuItem<Wry>,
    cut_node: MenuItem<Wry>,
    copy_node: MenuItem<Wry>,
    paste_node: MenuItem<Wry>,
    select_all_nodes: MenuItem<Wry>,
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
async fn open_settings_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("settings") {
        None => {
            WebviewWindowBuilder::new(&app, "settings", WebviewUrl::App("/settings".into()))
                .title("Settings")
                .inner_size(800.0, 600.0)
                .min_inner_size(400.0, 600.0)
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
async fn open_export_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("export") {
        None => {
            WebviewWindowBuilder::new(&app, "export", WebviewUrl::App("/export".into()))
                .title("Export")
                .inner_size(1000.0, 600.0)
                .min_inner_size(400.0, 600.0)
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
async fn open_edges_outliner_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("edges-outliner") {
        None => {
            WebviewWindowBuilder::new(
                &app,
                "edges-outliner",
                WebviewUrl::App("/edges-outliner".into()),
            )
            .title("Edges Outliner")
            .always_on_top(true)
            .inner_size(700.0, 600.0)
            .min_inner_size(700.0, 600.0)
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
async fn open_generate_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("generate") {
        None => {
            WebviewWindowBuilder::new(
                &app,
                "generate",
                WebviewUrl::App("/generate".into()),
            )
            .title("Generate Diagram")
            .inner_size(400.0, 500.0)
            .min_inner_size(400.0, 500.0)
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
async fn open_history_window(app: AppHandle) -> tauri::Result<()> {
    match app.webview_windows().get("history") {
        None => {
            WebviewWindowBuilder::new(&app, "history", WebviewUrl::App("/history".into()))
                .title("History")
                .always_on_top(true)
                .inner_size(400.0, 500.0)
                .min_inner_size(400.0, 500.0)
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
async fn generate_diagram(
    paths: Vec<String>,
    recursive: bool,
    generate_groups: bool,
) -> Result<generator::GenerateResult, String> {
    generator::generate_diagram_impl(paths, recursive, generate_groups)
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
async fn save_image_as(app: AppHandle, data: String) -> tauri::Result<()> {
    let file_path = app
        .dialog()
        .file()
        .set_file_name("exported_flow.png")
        .set_title("Save Image As")
        .add_filter("PNG Image", &["png"])
        .blocking_save_file();

    if let Some(path) = file_path {
        let file_path = path.to_string();
        let raw_content_string = data.trim_start_matches("data:image/png;base64,");
        let decoded_bytes = BASE64_STANDARD.decode(raw_content_string).unwrap();
        let img = image::load_from_memory(&decoded_bytes).unwrap();

        img.save(&file_path).unwrap();
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
                .await?;
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
async fn get_recent_projects() -> Vec<RecentProject> {
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

#[tauri::command]
async fn toggle_menu_item(
    state: tauri::State<'_, Mutex<AppState>>,
    item: &str,
    enabled: bool,
) -> tauri::Result<()> {
    let state = state.lock().unwrap();

    match item {
        "save" => {
            state.menu_items.save.set_enabled(enabled)?;
        }
        "save_as" => {
            state.menu_items.save_as.set_enabled(enabled)?;
        }
        "cut_node" => {
            state.menu_items.cut_node.set_enabled(enabled)?;
        }
        "copy_node" => {
            state.menu_items.copy_node.set_enabled(enabled)?;
        }
        "paste_node" => {
            state.menu_items.paste_node.set_enabled(enabled)?;
        }
        "select_all_nodes" => {
            state.menu_items.select_all_nodes.set_enabled(enabled)?;
        }
        _ => {}
    }

    Ok(())
}

#[tauri::command]
async fn set_settings_state(
    app: AppHandle,
    state: tauri::State<'_, Mutex<AppState>>,
    theme: Option<String>,
    pan_on_scroll: Option<bool>,
    show_minimap: Option<bool>,
    colored_nodes: Option<bool>,
    show_controls: Option<bool>,
    edge_style: Option<String>,
    auto_save: Option<bool>,
    auto_save_interval: Option<u32>,
    show_grid: Option<bool>,
    snap_to_grid: Option<bool>,
    grid_size: Option<u32>,
    compact_nodes: Option<bool>,
    object_node_access_modifier_color_light: Option<String>,
    object_node_access_modifier_color_dark: Option<String>,
    object_node_type_separator_color_light: Option<String>,
    object_node_type_separator_color_dark: Option<String>,
    object_node_type_color_light: Option<String>,
    object_node_type_color_dark: Option<String>,
    object_node_default_value_color_light: Option<String>,
    object_node_default_value_color_dark: Option<String>,
    object_node_parameter_name_color_light: Option<String>,
    object_node_parameter_name_color_dark: Option<String>,
    node_border_radius: Option<u32>,
    show_edge_labels: Option<bool>,
) -> tauri::Result<()> {
    let mut state = state.lock().unwrap();

    state.settings.theme = theme.unwrap_or(state.settings.theme.clone());
    state.settings.pan_on_scroll = pan_on_scroll.unwrap_or(state.settings.pan_on_scroll);
    state.settings.show_minimap = show_minimap.unwrap_or(state.settings.show_minimap);
    state.settings.colored_nodes = colored_nodes.unwrap_or(state.settings.colored_nodes);
    state.settings.show_controls = show_controls.unwrap_or(state.settings.show_controls);
    state.settings.edge_style = edge_style.unwrap_or(state.settings.edge_style.clone());
    state.settings.auto_save = auto_save.unwrap_or(state.settings.auto_save);
    state.settings.auto_save_interval =
        auto_save_interval.unwrap_or(state.settings.auto_save_interval);

    state.settings.show_grid = show_grid.unwrap_or(state.settings.show_grid);
    state.settings.snap_to_grid = snap_to_grid.unwrap_or(state.settings.snap_to_grid);
    state.settings.grid_size = grid_size.unwrap_or(state.settings.grid_size);

    state.settings.compact_nodes = compact_nodes.unwrap_or(state.settings.compact_nodes);
    state.settings.object_node_access_modifier_color_light =
        object_node_access_modifier_color_light.unwrap_or(
            state
                .settings
                .object_node_access_modifier_color_light
                .clone(),
        );
    state.settings.object_node_access_modifier_color_dark = object_node_access_modifier_color_dark
        .unwrap_or(
            state
                .settings
                .object_node_access_modifier_color_dark
                .clone(),
        );
    state.settings.object_node_type_separator_color_light = object_node_type_separator_color_light
        .unwrap_or(
            state
                .settings
                .object_node_type_separator_color_light
                .clone(),
        );
    state.settings.object_node_type_separator_color_dark = object_node_type_separator_color_dark
        .unwrap_or(state.settings.object_node_type_separator_color_dark.clone());
    state.settings.object_node_type_color_light =
        object_node_type_color_light.unwrap_or(state.settings.object_node_type_color_light.clone());
    state.settings.object_node_type_color_dark =
        object_node_type_color_dark.unwrap_or(state.settings.object_node_type_color_dark.clone());
    state.settings.object_node_default_value_color_light = object_node_default_value_color_light
        .unwrap_or(state.settings.object_node_default_value_color_light.clone());
    state.settings.object_node_default_value_color_dark = object_node_default_value_color_dark
        .unwrap_or(state.settings.object_node_default_value_color_dark.clone());
    state.settings.object_node_parameter_name_color_light = object_node_parameter_name_color_light
        .unwrap_or(
            state
                .settings
                .object_node_parameter_name_color_light
                .clone(),
        );
    state.settings.object_node_parameter_name_color_dark = object_node_parameter_name_color_dark
        .unwrap_or(state.settings.object_node_parameter_name_color_dark.clone());
    state.settings.node_border_radius =
        node_border_radius.unwrap_or(state.settings.node_border_radius);

    state.settings.show_edge_labels = show_edge_labels.unwrap_or(state.settings.show_edge_labels);

    app.emit(
        "settings-updated",
        serde_json::json!({
            "theme": state.settings.theme,
            "panOnScroll": state.settings.pan_on_scroll,
            "showMinimap": state.settings.show_minimap,
            "coloredNodes": state.settings.colored_nodes,
            "showControls": state.settings.show_controls,
            "edgeStyle": state.settings.edge_style,
            "autoSave": state.settings.auto_save,
            "autoSaveInterval": state.settings.auto_save_interval,
            "showGrid": state.settings.show_grid,
            "snapToGrid": state.settings.snap_to_grid,
            "gridSize": state.settings.grid_size,
            "compactNodes": state.settings.compact_nodes,              
            "objectNodeAccessModifierColorLight": state.settings.object_node_access_modifier_color_light,
            "objectNodeAccessModifierColorDark": state.settings.object_node_access_modifier_color_dark,
            "objectNodeTypeSeparatorColorLight": state.settings.object_node_type_separator_color_light,
            "objectNodeTypeSeparatorColorDark": state.settings.object_node_type_separator_color_dark,
            "objectNodeTypeColorLight": state.settings.object_node_type_color_light,
            "objectNodeTypeColorDark": state.settings.object_node_type_color_dark,
            "objectNodeDefaultValueColorLight": state.settings.object_node_default_value_color_light,
            "objectNodeDefaultValueColorDark": state.settings.object_node_default_value_color_dark,
            "objectNodeParameterNameColorLight": state.settings.object_node_parameter_name_color_light,
            "objectNodeParameterNameColorDark": state.settings.object_node_parameter_name_color_dark,            
            "nodeBorderRadius": state.settings.node_border_radius,
            "showEdgeLabels": state.settings.show_edge_labels,
        }),
    )?;

    Ok(())
}

#[tauri::command]
async fn get_settings_state(state: tauri::State<'_, Mutex<AppState>>) -> Result<SettingsState, ()> {
    let state = state.lock().unwrap();
    Ok(state.settings.clone())
}

#[tauri::command]
async fn save_settings_state(state: tauri::State<'_, Mutex<AppState>>) -> tauri::Result<()> {
    let state = state.lock().unwrap();
    util::save_settings(&state.settings);
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
            open_settings_window,
            open_export_window,
            open_edges_outliner_window,
            open_history_window,
            open_generate_window,
            generate_diagram,
            close_window,
            request_project_details,
            request_project_data,
            save_file,
            save_file_as,
            save_image_as,
            open_project_file,
            open_project_path,
            get_recent_projects,
            clear_recent_projects,
            remove_recent_project,
            toggle_menu_item,
            set_settings_state,
            get_settings_state,
            save_settings_state
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let _ = open_welcome_window(handle).await;
            });

            let settings_item =
                MenuItem::with_id(app, "settings", "Settings", true, Some("CMD+,")).unwrap();

            let about_menu = SubmenuBuilder::new(app, "About")
                .item(&settings_item)
                .separator()
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

            let export_item =
                MenuItem::with_id(app, "export", "Export...", true, Some("CMD+E")).unwrap();

            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&new_project_item)
                .separator()
                .item(&open_project_item)
                .separator()
                .item(&save_item)
                .item(&save_as_item)
                .separator()
                .item(&export_item)
                .separator()
                .close_window()
                .build()?;

            let cut_node_item = MenuItem::with_id(app, "cut", "Cut Node", false, Some("CMD+X"))?;
            let copy_node_item = MenuItem::with_id(app, "copy", "Copy Node", false, Some("CMD+C"))?;
            let paste_node_item =
                MenuItem::with_id(app, "paste", "Paste Node", false, Some("CMD+V"))?;
            let select_all_nodes_item =
                MenuItem::with_id(app, "select_all", "Select All Nodes", false, Some("CMD+A"))?;

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

            let edges_outliner_item =
                MenuItem::with_id(app, "edges_outliner", "Edges Outliner", true, Some("CMD+L"))?;
            let history_item = MenuItem::with_id(app, "history", "History", true, Some("CMD+H"))?;

            let view_menu = SubmenuBuilder::new(app, "View")
                .item(&history_item)
                .separator()
                .item(&edges_outliner_item)
                .build()?;

            let arrange_vertically_item = MenuItem::with_id(
                app,
                "arrange_vertically",
                "Make Vertical",
                true,
                Some("CMD+SHIFT+V"),
            )?;

            let arrange_horizontally_item = MenuItem::with_id(
                app,
                "arrange_horizontally",
                "Make Horizontal",
                true,
                Some("CMD+SHIFT+H"),
            )?;

            let arrange_menu = SubmenuBuilder::new(app, "Arrange")
                .item(&arrange_vertically_item)
                .item(&arrange_horizontally_item)
                .build()?;

            let generate_from_code_item = MenuItem::with_id(
                app,
                "generate_from_code",
                "From Source Code...",
                true,
                None::<String>,
            )?;

            let generate_menu = SubmenuBuilder::new(app, "Generate")
                .item(&generate_from_code_item)
                .build()?;

            let window_menu = SubmenuBuilder::new(app, "Window").minimize().build()?;

            let menu = MenuBuilder::new(app)
                .items(&[
                    &about_menu,
                    &file_menu,
                    &edit_menu,
                    &arrange_menu,
                    &generate_menu,
                    &view_menu,
                    &window_menu,
                ])
                .build()?;

            let settings_state = util::load_settings().unwrap_or_default();

            app.manage(Mutex::new(AppState {
                menu_items: MenuItems {
                    save: save_item.clone(),
                    save_as: save_as_item.clone(),
                    cut_node: cut_node_item.clone(),
                    copy_node: copy_node_item.clone(),
                    paste_node: paste_node_item.clone(),
                    select_all_nodes: select_all_nodes_item.clone(),
                },
                project_details: ProjectDetails {
                    name: None,
                    path: None,
                },
                settings: settings_state,
            }));

            app.set_menu(menu)?;

            app.on_menu_event(move |app: &AppHandle, event: MenuEvent| {
                match event.id().0.as_str() {
                    "settings" => {
                        tauri::async_runtime::spawn(open_settings_window(app.clone()));
                    }
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
                    "export" => {
                        tauri::async_runtime::spawn(open_export_window(app.clone()));
                    }
                    "edges_outliner" => {
                        tauri::async_runtime::spawn(open_edges_outliner_window(app.clone()));
                    }
                    "history" => {
                        tauri::async_runtime::spawn(open_history_window(app.clone()));
                    }
                    "undo" | "redo" => {
                        app.emit(event.id().0.as_str(), ()).unwrap();
                    }
                    "arrange_vertically" => {
                        app.emit("arrange-nodes", serde_json::json!({ "direction": "DOWN" }))
                            .unwrap();
                    }
                    "arrange_horizontally" => {
                        app.emit("arrange-nodes", serde_json::json!({ "direction": "RIGHT" }))
                            .unwrap();
                    }
                    "cut" | "copy" | "paste" | "select_all" => {
                        app.emit(format!("editor-{}", event.id().0).as_str(), ())
                            .unwrap();
                    }
                    "generate_from_code" => {
                        tauri::async_runtime::spawn(open_generate_window(app.clone()));
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
