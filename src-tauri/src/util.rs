use std::fs;

use platform_dirs::AppDirs;

pub struct ProjectData {
    pub name: String,
    pub path: String,
    pub content: String,
}

impl ProjectData {
    pub fn new(name: String, path: String, content: String) -> Self {
        Self {
            name,
            path,
            content,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct RecentProject {
    pub name: String,
    pub path: String,
}

impl RecentProject {
    pub fn new(name: String, path: String) -> Self {
        Self { name, path }
    }
}

pub fn get_project_data_from_path(path: &str) -> std::io::Result<ProjectData> {
    let path_buf = std::path::PathBuf::from(path);
    let name = path_buf
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("untitled")
        .to_string();
    let content = std::fs::read_to_string(&path_buf)?;
    Ok(ProjectData::new(name, path.to_string(), content))
}

pub fn get_recent_projects() -> Vec<RecentProject> {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let recent_projects_path = app_dirs.data_dir.join("recent_projects.json");

    fs::create_dir_all(&app_dirs.data_dir).unwrap();

    if !recent_projects_path.exists() {
        fs::write(&recent_projects_path, "[]").unwrap();
    }

    let data = fs::read_to_string(&recent_projects_path).unwrap();

    if let Ok(recent_projects) = serde_json::from_str::<Vec<RecentProject>>(&data) {
        return recent_projects;
    }

    vec![]
}

pub fn add_recent_project(project: RecentProject) {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let recent_projects_path = app_dirs.data_dir.join("recent_projects.json");

    let mut recent_projects = get_recent_projects();

    // Remove existing entry if it exists
    recent_projects.retain(|p| p.path != project.path);

    // Add the new project to the front
    recent_projects.insert(0, project.clone());

    // Limit to 10 recent projects
    if recent_projects.len() > 10 {
        recent_projects.truncate(10);
    }

    let data = serde_json::to_string_pretty(&recent_projects).unwrap();
    fs::write(&recent_projects_path, data).unwrap();
}

pub fn remove_recent_project(path: &str) {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let recent_projects_path = app_dirs.data_dir.join("recent_projects.json");

    let mut recent_projects = get_recent_projects();

    // Remove the project with the specified path
    recent_projects.retain(|p| p.path != path);

    let data = serde_json::to_string_pretty(&recent_projects).unwrap();
    fs::write(&recent_projects_path, data).unwrap();
}

pub fn clear_recent_projects() {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let recent_projects_path = app_dirs.data_dir.join("recent_projects.json");

    fs::write(&recent_projects_path, "[]").unwrap();
}

pub fn save_settings<T: serde::Serialize>(settings: &T) {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let settings_path = app_dirs.data_dir.join("settings.json");

    fs::create_dir_all(&app_dirs.data_dir).unwrap();

    let data = serde_json::to_string_pretty(settings).unwrap();
    fs::write(&settings_path, data).unwrap();
}

pub fn load_settings<T: serde::de::DeserializeOwned>() -> Option<T> {
    let app_dirs = AppDirs::new(Some("Frost"), true).unwrap();
    let settings_path = app_dirs.data_dir.join("settings.json");

    if !settings_path.exists() {
        return None;
    }

    let data = fs::read_to_string(&settings_path).ok()?;
    serde_json::from_str(&data).ok()
}
