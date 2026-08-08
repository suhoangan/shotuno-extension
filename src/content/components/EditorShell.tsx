import Toolbar from './Toolbar';
import CanvasEditor from './CanvasEditor';
import { ErrorBoundary } from '../../components/ErrorBoundary';

/** Editor UI chunk — imported lazily so capture modes do not pull Konva. */
export default function EditorShell({
  screenshotUrl,
  onClose,
}: {
  screenshotUrl: string;
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden font-sans bg-foreground/30 backdrop-blur-md pointer-events-auto"
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
    >
      <Toolbar onClose={onClose} />
      <div className="w-full h-full">
        <ErrorBoundary fallbackTitle="Canvas crashed">
          <CanvasEditor screenshotUrl={screenshotUrl} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
