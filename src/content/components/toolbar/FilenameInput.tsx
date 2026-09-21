import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { CHROME, BAR_GAP } from './toolbarUi';
import {
  getCaptureSettings,
  onCaptureSettingsChange,
  type DownloadImageFormat,
} from '../../../lib/captureSettings';

interface FilenameInputProps {
  filename: string;
  onChange: (value: string) => void;
}

export function FilenameInput({ filename, onChange }: FilenameInputProps) {
  const [extension, setExtension] = useState<DownloadImageFormat>('png');

  useEffect(() => {
    void getCaptureSettings().then((s) => setExtension(s.downloadFormat));
    return onCaptureSettingsChange((s) => setExtension(s.downloadFormat));
  }, []);

  return (
    <div className="fixed bottom-6 left-4 z-[9999999] pointer-events-auto">
      <div className={`${CHROME} px-2 py-0.5 text-sm flex items-center ${BAR_GAP}`}>
        <Input
          value={filename}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none outline-none text-left w-48 text-foreground focus-visible:ring-1 focus-visible:ring-ring rounded h-8 shadow-none font-medium px-1.5"
        />
        <span className="text-muted-foreground pr-1.5">.{extension}</span>
      </div>
    </div>
  );
}
