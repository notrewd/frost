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
