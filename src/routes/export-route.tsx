import { useCallback, useEffect, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SettingsField from "@/components/ui/settings-field";
import { Switch } from "@/components/ui/switch";
import { Download, Loader2 } from "lucide-react";
import { NumberInput } from "@/components/ui/number-input";
import { invoke } from "@tauri-apps/api/core";

const ExportRoute = () => {
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [padding, setPadding] = useState(10);

  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    setImageData(null);
    const unlisten = listen<string>("export-image-ready", (event) => {
      setImageData(event.payload);
    });

    emit("request-export-image", { transparentBackground, padding });

    return () => {
      unlisten.then((f) => f());
    };
  }, [transparentBackground, padding]);

  const downloadImage = useCallback(() => {
    if (!imageData) return;
    invoke("save_image_as", { data: imageData });
  }, [imageData]);

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 grid grid-rows-1 gap-6 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] min-h-0">
        <div className="flex flex-col justify-center items-start border rounded-md p-6 self-center">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Export Flow</h2>
            <p className="text-sm text-muted-foreground">
              Configure your export settings and download your flow as a PNG
              image.
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <SettingsField label="Transparent Background">
                <Switch
                  checked={transparentBackground}
                  onCheckedChange={(checked) => {
                    setTransparentBackground(checked);
                  }}
                />
              </SettingsField>
              <SettingsField label="Padding">
                <NumberInput
                  value={padding}
                  onChange={(value) => setPadding(Number(value))}
                  variant="small"
                />
              </SettingsField>
            </div>
          </div>
          <Separator className="my-4 w-full" />
          <Button
            className="self-end"
            variant="outline"
            onClick={downloadImage}
          >
            <Download className="size-4" />
            Export as PNG
          </Button>
        </div>
        <div className="min-h-0 min-w-0 flex items-center justify-center">
          {imageData ? (
            <img
              className="rounded-md max-h-full max-w-full object-contain"
              src={imageData || undefined}
              alt="Exported flow"
            />
          ) : (
            <Loader2 className="animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportRoute;
