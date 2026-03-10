import { useCallback, useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";

const ExportRoute = () => {
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<string>("export-image-ready", (event) => {
      if (event.payload) {
        setImageData(event.payload);
        console.log("Image data URL received");
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const downloadImage = useCallback((dataUrl: string) => {
    const a = document.createElement("a");
    a.setAttribute("download", "reactflow.png");
    a.setAttribute("href", dataUrl);
    a.click();
  }, []);

  const handleExport = useCallback(async () => {
    await emit("request-export-image");
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {imageData && (
        <div className="flex flex-col items-center gap-4">
          <img src={imageData} alt="Exported flow" />
          <Button onClick={() => downloadImage(imageData)}>
            Download Image
          </Button>
        </div>
      )}
      <div className="flex flex-1">
        <Button variant="outline" onClick={handleExport} className="mb-4">
          Export as PNG
        </Button>
      </div>
    </div>
  );
};

export default ExportRoute;
