import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { open } from "@tauri-apps/plugin-dialog";

const appWindow = getCurrentWindow();

export default function GenerateRoute() {
  const [language, setLanguage] = useState("Java");
  const [paths, setPaths] = useState<string[]>([]);
  const [recursive, setRecursive] = useState(false);
  const [generateGroups, setGenerateGroups] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (lang) {
      setLanguage(lang);
    }
  }, []);

  const handleSelectFiles = async () => {
    const selected = await open({
      multiple: true,
      directory: false,
    });
    if (Array.isArray(selected)) {
      setPaths(selected);
    } else if (selected) {
      setPaths([selected]);
    }
  };

  const handleSelectDirectories = async () => {
    const selected = await open({
      multiple: true,
      directory: true,
    });
    if (Array.isArray(selected)) {
      setPaths(selected);
    } else if (selected) {
      setPaths([selected]);
    }
  };

  const handleGenerate = async () => {
    try {
      const generated: any = await invoke("generate_diagram", {
        language,
        paths,
        recursive,
        generateGroups,
      });

      const nodes = generated.nodes || [];

      const customEdges: any[] = [];
      const getNodeId = (name: string) =>
        nodes.find((n: any) => n.data?.name === name)?.id;

      nodes.forEach((node: any) => {
        const sourceId = node.id;
        const data = node.data || {};

        // Generalization
        if (Array.isArray(data.extends)) {
          data.extends.forEach((ext: string) => {
            const targetId = getNodeId(ext);
            if (targetId && targetId !== sourceId) {
              customEdges.push({
                id: crypto.randomUUID(),
                source: sourceId,
                target: targetId,
                sourceHandle: "top",
                targetHandle: "bottom",
                type: "generalization",
              });
            }
          });
        }

        // Implementation
        if (Array.isArray(data.implements)) {
          data.implements.forEach((imp: string) => {
            const targetId = getNodeId(imp);
            if (targetId && targetId !== sourceId) {
              customEdges.push({
                id: crypto.randomUUID(),
                source: sourceId,
                target: targetId,
                sourceHandle: "top",
                targetHandle: "bottom",
                type: "implementation",
              });
            }
          });
        }

        // Association and Composition
        if (Array.isArray(data.attributes)) {
          data.attributes.forEach((attr: any) => {
            const typeStr = attr.type || "";
            const isCollection =
              typeStr.includes("[]") ||
              /(?:List|Set|Collection|Array|Vector)[<\[]/.test(typeStr);

            let cleanType = typeStr.replace(/\[\]/g, "");

            // Java/C++ generics
            const genericMatch = cleanType.match(
              /^(?:List|Set|Collection)<([^>]+)>$/,
            );
            if (genericMatch && genericMatch[1]) {
              cleanType = genericMatch[1];
            } else {
              const mapMatch = cleanType.match(
                /^(?:Map|HashMap)<(?:[^,]+),\s*([^>]+)>$/,
              );
              if (mapMatch && mapMatch[1]) {
                cleanType = mapMatch[1];
              }
            }

            // Python type hints like List[User] or Dict[str, User]
            const pyGenericMatch = cleanType.match(
              /^(?:List|Set|Collection|Optional|Sequence)\[([^\]]+)\]$/,
            );
            if (pyGenericMatch && pyGenericMatch[1]) {
              cleanType = pyGenericMatch[1];
            } else {
              const pyMapMatch = cleanType.match(
                /^(?:Dict|Mapping)\[(?:[^,]+),\s*([^\]]+)\]$/,
              );
              if (pyMapMatch && pyMapMatch[1]) {
                cleanType = pyMapMatch[1];
              }
            }

            cleanType = cleanType.trim();

            const targetId = getNodeId(cleanType);
            if (targetId && targetId !== sourceId) {
              const edgeType = isCollection ? "association" : "composition";

              const isDupe = customEdges.some(
                (e) =>
                  e.source === sourceId &&
                  e.target === targetId &&
                  e.type === edgeType,
              );
              if (!isDupe) {
                customEdges.push({
                  id: crypto.randomUUID(),
                  source: sourceId,
                  target: targetId,
                  sourceHandle: "top",
                  targetHandle: "bottom",
                  type: edgeType,
                });
              }
            }
          });
        }
      });

      const finalResult = {
        nodes,
        edges: customEdges,
      };

      console.log("Generation result with custom edges:", finalResult);

      await emit("diagram-generated", finalResult);
      await appWindow.close();
    } catch (error) {
      console.error("Error generating diagram:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-auto">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Generate Diagram</h2>
        <p className="text-sm text-muted-foreground">
          Import your source code to auto-generate a diagram.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="C++">C++</SelectItem>
              <SelectItem value="C#">C#</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source Files or Directories</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSelectFiles}
              className="flex-1"
            >
              Select Files
            </Button>
            <Button
              variant="outline"
              onClick={handleSelectDirectories}
              className="flex-1"
            >
              Select Directories
            </Button>
          </div>
          {paths.length > 0 && (
            <p className="text-sm mt-2 text-muted-foreground break-all">
              {paths.length} file/folder(s) selected
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="recursive"
            checked={recursive}
            onCheckedChange={(c) => setRecursive(!!c)}
          />
          <Label htmlFor="recursive">Import directories recursively</Label>
        </div>

        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="generateGroups"
            checked={generateGroups}
            onCheckedChange={(c) => setGenerateGroups(!!c)}
          />
          <Label htmlFor="generateGroups">
            Generate groups from directories
          </Label>
        </div>
      </div>

      <div className="mt-auto flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => appWindow.close()}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={paths.length === 0}>
          Generate
        </Button>
      </div>
    </div>
  );
}
