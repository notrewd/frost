use rust_code_analysis::{action, get_language_for_file, AstCallback, AstCfg, AstResponse, LANG};
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

#[derive(serde::Serialize, Debug)]
pub struct GenerateResult {
    pub nodes: Vec<serde_json::Value>,
    pub edges: Vec<serde_json::Value>,
}

#[derive(Debug, Default)]
struct UmlClass {
    name: String,
    is_interface: bool,
    extends: Vec<String>,
    implements: Vec<String>,
    fields: Vec<UmlField>,
    methods: Vec<UmlMethod>,
    path: String,
    group_id: Option<String>,
}

#[derive(Debug, Default)]
struct UmlField {
    name: String,
    field_type: String,
    access_modifier: String,
}

#[derive(Debug, Default)]
struct UmlMethod {
    name: String,
    return_type: String,
    access_modifier: String,
    parameters: Vec<UmlField>,
}

pub fn generate_diagram_impl(
    paths: Vec<String>,
    recursive: bool,
    generate_groups: bool,
) -> Result<GenerateResult, String> {
    let mut groups = HashMap::new();
    let mut files = Vec::new();

    if recursive {
        for path_str in paths {
            let path = Path::new(&path_str);
            if path.is_dir() {
                walk_directory(path, &mut groups, None, generate_groups, &mut files);
            } else if path.is_file() {
                files.push((path.to_path_buf(), None));
            }
        }
    } else {
        for path_str in paths {
            let path = Path::new(&path_str);
            if path.is_file() {
                files.push((path.to_path_buf(), None));
            }
        }
    }

    let mut classes = Vec::new();
    for (file_path, group_id) in files {
        if let Ok(source) = fs::read(&file_path) {
            if let Some(mut file_classes) = parse_uml_info(&file_path, &source) {
                for class in &mut file_classes {
                    class.group_id = group_id.clone();
                    class.path = file_path.to_string_lossy().to_string();
                }
                classes.extend(file_classes);
            }
        }
    }

    let mut nodes = vec![];
    for (_, group) in groups {
        nodes.push(group);
    }

    let mut edges = vec![];
    let class_names: HashSet<String> = classes.iter().map(|c| c.name.clone()).collect();

    // Position tracking (simple grid layout)
    let mut x = 0;
    let mut y = 0;

    for class in &classes {
        let node_id = class.name.clone(); // In real app use exact unique ID, maybe Path+Name

        let mut attributes = vec![];
        for field in &class.fields {
            attributes.push(json!({
                "id": Uuid::new_v4().to_string(),
                "name": field.name,
                "type": field.field_type,
                "accessModifier": field.access_modifier.to_lowercase()
            }));
        }

        let mut methods = vec![];
        for method in &class.methods {
            let mut params = vec![];
            for param in &method.parameters {
                params.push(json!({
                    "id": Uuid::new_v4().to_string(),
                    "name": param.name,
                    "type": param.field_type
                }));
            }
            methods.push(json!({
                "id": Uuid::new_v4().to_string(),
                "name": method.name,
                "returnType": method.return_type,
                "accessModifier": method.access_modifier.to_lowercase(),
                "parameters": params
            }));
        }

        let mut node = json!({
            "id": node_id,
            "type": "object",
            "position": { "x": x, "y": y },
            "data": {
                "name": class.name,
                "stereotype": if class.is_interface { "interface" } else { "" },
                "attributes": attributes,
                "methods": methods,
                "extends": class.extends,
                "implements": class.implements
            }
        });

        if let Some(group_id) = &class.group_id {
            node.as_object_mut()
                .unwrap()
                .insert("parentId".to_string(), json!(group_id));
        }

        nodes.push(node);
        x += 300;
        if x > 1500 {
            x = 0;
            y += 400;
        }

        // Implementation edges
        for im in &class.implements {
            if class_names.contains(im) {
                edges.push(json!({
                    "id": Uuid::new_v4().to_string(),
                    "source": node_id,
                    "target": im,
                    "type": "implementation",
                    "style": { "stroke": "var(--foreground)", "strokeWidth": 2 },
                    "markerEnd": { "color": "var(--foreground)", "type": "arrowclosed" }
                }));
            }
        }

        // Generalization edges
        for ex in &class.extends {
            if class_names.contains(ex) {
                edges.push(json!({
                    "id": Uuid::new_v4().to_string(),
                    "source": node_id,
                    "target": ex,
                    "type": "generalization",
                    "style": { "stroke": "var(--foreground)", "strokeWidth": 2 },
                    "markerEnd": { "color": "var(--foreground)", "type": "arrowclosed" }
                }));
            }
        }

        // Association/Composition edges (simplified inference from fields)
        for field in &class.fields {
            let t = field
                .field_type
                .replace("[]", "")
                .replace("List<", "")
                .replace(">", "");
            if class_names.contains(&t) && t != class.name {
                // Avoid self associations for clarity
                edges.push(json!({
                    "id": Uuid::new_v4().to_string(),
                    "source": node_id,
                    "target": t,
                    "type": "association",
                    "style": { "stroke": "var(--foreground)", "strokeWidth": 2 },
                    "markerEnd": { "color": "var(--foreground)", "type": "arrow" }
                }));
            }
        }
    }

    Ok(GenerateResult { nodes, edges })
}

fn walk_directory(
    path: &Path,
    groups: &mut HashMap<String, serde_json::Value>,
    parent_group: Option<String>,
    generate_groups: bool,
    files: &mut Vec<(PathBuf, Option<String>)>,
) {
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.into_iter().flatten() {
            let entry_path = entry.path();
            if entry_path.is_dir() {
                let name = entry.file_name().to_string_lossy().to_string();
                let group_id = format!("group_{}", name);

                let next_parent = if generate_groups {
                    groups.insert(
                        group_id.clone(),
                        json!({
                            "id": group_id,
                            "type": "group",
                            "position": { "x": 0, "y": 0 },
                            "data": { "name": name },
                            "parentId": parent_group
                        }),
                    );
                    Some(group_id)
                } else {
                    parent_group.clone()
                };

                walk_directory(&entry_path, groups, next_parent, generate_groups, files);
            } else if entry_path.is_file() {
                files.push((entry_path.clone(), parent_group.clone()));
            }
        }
    }
}

// Below is the fallback parser parsing AST via JSON
fn parse_uml_info(path: &Path, source: &[u8]) -> Option<Vec<UmlClass>> {
    let lang = get_language_for_file(path)?;
    let cfg = AstCfg {
        id: "uml_parser".to_string(),
        comment: false,
        span: false,
    };
    let resp: AstResponse = action::<AstCallback>(&lang, source.to_vec(), path, None, cfg);

    // We navigate through `AstResponse` via JSON serialization since `root` is private in our version
    let resp_val = serde_json::to_value(&resp).ok()?;
    let root = &resp_val["root"];
    if root.is_null() {
        return None;
    }

    let mut classes = Vec::new();
    match lang {
        LANG::Java => extract_java_classes(root, &mut classes),
        LANG::Python => extract_python_classes(root, &mut classes),
        LANG::Cpp => extract_cpp_classes(root, &mut classes),
        _ => return None,
    }
    Some(classes)
}

/// Recursively extract text from an AST node.
/// Leaf nodes have TextValue set directly; compound nodes (e.g., array_type, generic_type)
/// may have empty TextValue, so we concatenate children text instead.
fn get_node_text(node: &serde_json::Value) -> String {
    if let Some(text) = node["TextValue"].as_str() {
        if !text.is_empty() {
            return text.to_string();
        }
    }
    if let Some(children) = node["Children"].as_array() {
        let parts: Vec<String> = children.iter().map(|c| get_node_text(c)).collect();
        return parts.join("");
    }
    String::new()
}

fn extract_java_classes(node: &serde_json::Value, classes: &mut Vec<UmlClass>) {
    let t = node["Type"].as_str().unwrap_or("");
    if t == "class_declaration" || t == "interface_declaration" {
        let mut class = UmlClass {
            is_interface: t == "interface_declaration",
            ..Default::default()
        };

        if let Some(children) = node["Children"].as_array() {
            for child in children {
                let ct = child["Type"].as_str().unwrap_or("");
                if ct == "identifier" {
                    class.name = child["TextValue"].as_str().unwrap_or("").to_string();
                } else if ct == "superclass" {
                    if let Some(sc_children) = child["Children"].as_array() {
                        for c in sc_children {
                            if c["Type"].as_str().unwrap_or("") == "type_identifier" {
                                class.extends.push(get_node_text(c));
                            }
                        }
                    }
                } else if ct == "super_interfaces" {
                    if let Some(si_children) = child["Children"].as_array() {
                        for tl in si_children {
                            let tl_type = tl["Type"].as_str().unwrap_or("");
                            if tl_type == "type_list" || tl_type == "interface_type_list" {
                                if let Some(tl_children) = tl["Children"].as_array() {
                                    for c in tl_children {
                                        if c["Type"].as_str().unwrap_or("") == "type_identifier" {
                                            class.implements.push(get_node_text(c));
                                        }
                                    }
                                }
                            } else if tl_type == "type_identifier" {
                                class.implements.push(get_node_text(tl));
                            }
                        }
                    }
                } else if ct == "extends_interfaces" {
                    // For interface declarations: interface A extends B, C
                    if let Some(ei_children) = child["Children"].as_array() {
                        for tl in ei_children {
                            let tl_type = tl["Type"].as_str().unwrap_or("");
                            if tl_type == "type_list" || tl_type == "interface_type_list" {
                                if let Some(tl_children) = tl["Children"].as_array() {
                                    for c in tl_children {
                                        if c["Type"].as_str().unwrap_or("") == "type_identifier" {
                                            class.extends.push(get_node_text(c));
                                        }
                                    }
                                }
                            } else if tl_type == "type_identifier" {
                                class.extends.push(get_node_text(tl));
                            }
                        }
                    }
                } else if ct == "class_body" || ct == "interface_body" {
                    if let Some(body_children) = child["Children"].as_array() {
                        for body_child in body_children {
                            let bct = body_child["Type"].as_str().unwrap_or("");
                            if bct == "field_declaration" {
                                let mut field_type = String::new();
                                let mut field_names = Vec::new();
                                let mut access = "private".to_string();
                                if let Some(fd_children) = body_child["Children"].as_array() {
                                    for part in fd_children {
                                        let pt = part["Type"].as_str().unwrap_or("");
                                        if pt == "modifiers" {
                                            if let Some(m_children) = part["Children"].as_array() {
                                                for m in m_children {
                                                    let text = m["TextValue"].as_str().unwrap_or("").to_string();
                                                    if text == "public" || text == "private" || text == "protected" {
                                                        access = text;
                                                        break;
                                                    }
                                                }
                                            }
                                        } else if pt.ends_with("type") || pt == "type_identifier" {
                                            field_type = get_node_text(part);
                                        } else if pt == "variable_declarator" {
                                            if let Some(vd_children) = part["Children"].as_array() {
                                                for decl_part in vd_children {
                                                    if decl_part["Type"].as_str().unwrap_or("")
                                                        == "identifier"
                                                    {
                                                        field_names.push(
                                                            decl_part["TextValue"]
                                                                .as_str()
                                                                .unwrap_or("")
                                                                .to_string(),
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                for name in field_names {
                                    class.fields.push(UmlField {
                                        name,
                                        field_type: field_type.clone(),
                                        access_modifier: access.clone(),
                                    });
                                }
                            } else if bct == "method_declaration" {
                                let mut method = UmlMethod {
                                    access_modifier: "public".into(),
                                    ..Default::default()
                                };
                                if let Some(md_children) = body_child["Children"].as_array() {
                                    for part in md_children {
                                        let pt = part["Type"].as_str().unwrap_or("");
                                        if pt == "modifiers" {
                                            if let Some(m_children) = part["Children"].as_array() {
                                                for m in m_children {
                                                    let text = m["TextValue"].as_str().unwrap_or("").to_string();
                                                    if text == "public" || text == "private" || text == "protected" {
                                                        method.access_modifier = text;
                                                        break;
                                                    }
                                                }
                                            }
                                        } else if pt.ends_with("type") || pt == "type_identifier" {
                                            method.return_type = get_node_text(part);
                                        } else if pt == "identifier" {
                                            method.name = part["TextValue"]
                                                .as_str()
                                                .unwrap_or("")
                                                .to_string();
                                        } else if pt == "formal_parameters" {
                                            if let Some(fp_children) = part["Children"].as_array() {
                                                for param in fp_children {
                                                    if param["Type"].as_str().unwrap_or("")
                                                        == "formal_parameter"
                                                    {
                                                        let mut p_type = String::new();
                                                        let mut p_name = String::new();
                                                        if let Some(p_children) =
                                                            param["Children"].as_array()
                                                        {
                                                            for p in p_children {
                                                                let ppt = p["Type"]
                                                                    .as_str()
                                                                    .unwrap_or("");
                                                                if ppt.ends_with("type") || ppt == "type_identifier" {
                                                                    p_type = get_node_text(p);
                                                                }
                                                                if ppt == "identifier" {
                                                                    p_name = p["TextValue"]
                                                                        .as_str()
                                                                        .unwrap_or("")
                                                                        .to_string();
                                                                }
                                                            }
                                                        }
                                                        method.parameters.push(UmlField {
                                                            name: p_name,
                                                            field_type: p_type,
                                                            access_modifier: "".into(),
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                class.methods.push(method);
                            }
                        }
                    }
                }
            }
        }
        classes.push(class);
    }

    if let Some(children) = node["Children"].as_array() {
        for child in children {
            extract_java_classes(child, classes);
        }
    }
}

fn extract_python_classes(node: &serde_json::Value, classes: &mut Vec<UmlClass>) {
    let t = node["Type"].as_str().unwrap_or("");
    if t == "class_definition" {
        let mut class = UmlClass::default();
        if let Some(children) = node["Children"].as_array() {
            for child in children {
                let ct = child["Type"].as_str().unwrap_or("");
                if ct == "identifier" {
                    class.name = child["TextValue"].as_str().unwrap_or("").to_string();
                } else if ct == "argument_list" {
                    if let Some(al_children) = child["Children"].as_array() {
                        for c in al_children {
                            let ct2 = c["Type"].as_str().unwrap_or("");
                            if ct2 == "identifier" || ct2 == "attribute" {
                                class
                                    .extends
                                    .push(c["TextValue"].as_str().unwrap_or("").to_string());
                            }
                        }
                    }
                } else if ct == "block" {
                    if let Some(b_children) = child["Children"].as_array() {
                        for stmt in b_children {
                            let st = stmt["Type"].as_str().unwrap_or("");
                            if st == "expression_statement" {
                                if let Some(s_children) = stmt["Children"].as_array() {
                                    for expr in s_children {
                                        if expr["Type"].as_str().unwrap_or("") == "assignment" {
                                            let mut field_name = String::new();
                                            let mut field_type = "Any".to_string();
                                            if let Some(e_children) = expr["Children"].as_array() {
                                                for p in e_children {
                                                    let pt = p["Type"].as_str().unwrap_or("");
                                                    if pt == "identifier" {
                                                        field_name = p["TextValue"]
                                                            .as_str()
                                                            .unwrap_or("")
                                                            .to_string();
                                                    } else if pt == "attribute" {
                                                        let val =
                                                            p["TextValue"].as_str().unwrap_or("");
                                                        if val.starts_with("self.") {
                                                            field_name = val
                                                                .trim_start_matches("self.")
                                                                .to_string();
                                                        }
                                                    } else if pt == "call" {
                                                        if let Some(p_children) =
                                                            p["Children"].as_array()
                                                        {
                                                            if let Some(ident) =
                                                                p_children.iter().find(|c| {
                                                                    c["Type"].as_str().unwrap_or("")
                                                                        == "identifier"
                                                                })
                                                            {
                                                                field_type = ident["TextValue"]
                                                                    .as_str()
                                                                    .unwrap_or("")
                                                                    .to_string();
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            if !field_name.is_empty() {
                                                class.fields.push(UmlField {
                                                    name: field_name,
                                                    field_type,
                                                    access_modifier: "public".into(),
                                                });
                                            }
                                        }
                                    }
                                }
                            } else if st == "function_definition" {
                                let mut m = UmlMethod {
                                    access_modifier: "public".into(),
                                    return_type: "Any".into(),
                                    ..Default::default()
                                };
                                if let Some(s_children) = stmt["Children"].as_array() {
                                    for p in s_children {
                                        if p["Type"].as_str().unwrap_or("") == "identifier" {
                                            m.name =
                                                p["TextValue"].as_str().unwrap_or("").to_string();
                                        }
                                    }
                                }
                                class.methods.push(m);
                            }
                        }
                    }
                }
            }
        }
        classes.push(class);
    }

    if let Some(children) = node["Children"].as_array() {
        for child in children {
            extract_python_classes(child, classes);
        }
    }
}

// Fallbacks for cpp/csharp
fn extract_cpp_classes(node: &serde_json::Value, classes: &mut Vec<UmlClass>) {
    let t = node["Type"].as_str().unwrap_or("");
    if t == "class_specifier" || t == "struct_specifier" {
        let mut class = UmlClass::default();
        if let Some(children) = node["Children"].as_array() {
            for child in children {
                let ct = child["Type"].as_str().unwrap_or("");
                if ct == "type_identifier" {
                    class.name = child["TextValue"].as_str().unwrap_or("").to_string();
                } else if ct == "base_class_clause" {
                    if let Some(b_children) = child["Children"].as_array() {
                        for b in b_children {
                            if b["Type"].as_str().unwrap_or("") == "type_identifier" {
                                class
                                    .extends
                                    .push(b["TextValue"].as_str().unwrap_or("").to_string());
                            }
                        }
                    }
                }
            }
        }
        classes.push(class);
    }
    if let Some(children) = node["Children"].as_array() {
        for child in children {
            extract_cpp_classes(child, classes);
        }
    }
}
