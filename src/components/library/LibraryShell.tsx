import { useCallback, useEffect, useRef, useState } from 'react';
import { FolderOpen, Images, LogIn, LogOut, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { webUrl } from '../../lib/api';
import { Button } from '../ui/button';
import { GalleryPanel, type GalleryDragMode } from '../gallery/GalleryPanel';
import { PinPanel } from '../pins/PinPanel';
import type { GalleryImage } from '../../lib/galleryDb';

export type LibraryTab = 'pins' | 'downloads';

type AuthUser = { email?: string; token: string };

interface LibraryShellProps {
  dragMode: GalleryDragMode;
  onOpenImageFile?: (file: File) => void;
  className?: string;
}

export function LibraryShell({
  dragMode,
  onOpenImageFile,
  className = '',
}: LibraryShellProps) {
  const [tab, setTab] = useState<LibraryTab>('pins');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get(['authToken', 'authUser'], (result) => {
      if (result.authToken) {
        setUser({
          token: result.authToken as string,
          email: (result.authUser as { email?: string } | undefined)?.email,
        });
      }
    });
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local') return;
      if (changes.authToken || changes.authUser) {
        const token = changes.authToken?.newValue as string | undefined;
        const authUser = changes.authUser?.newValue as { email?: string } | undefined;
        if (token) setUser({ token, email: authUser?.email });
        else setUser(null);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleImagesChange = useCallback((next: GalleryImage[]) => setImages(next), []);

  return (
    <div className={`flex flex-col h-full min-h-0 bg-background text-foreground ${className}`}>
      <div className="px-3 py-2 border-b border-border/60 flex items-center gap-2">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted min-w-0 flex-1">
          <Button
            variant={tab === 'pins' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 flex-1 text-xs gap-1 ${
              tab === 'pins'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('pins')}
            aria-pressed={tab === 'pins'}
          >
            <Pin size={13} /> Pins
          </Button>
          <Button
            variant={tab === 'downloads' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 flex-1 text-xs gap-1 ${
              tab === 'downloads'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('downloads')}
            aria-pressed={tab === 'downloads'}
          >
            <Images size={13} /> Downloads
          </Button>
        </div>

        {onOpenImageFile && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onOpenImageFile(file);
                e.target.value = '';
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              title="Open image to edit"
              onClick={() => fileRef.current?.click()}
            >
              <FolderOpen size={14} />
            </Button>
          </>
        )}

        {!user ? (
          <Button
            size="sm"
            className="h-8 shrink-0 px-2.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              window.open(webUrl('/login'), '_blank');
              toast.info('Log in on the website — session syncs to the extension');
            }}
          >
            <LogIn size={13} className="mr-1" />
            Log in
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            title={user.email || 'Log out'}
            onClick={() => {
              if (typeof chrome !== 'undefined' && chrome.storage?.local) {
                chrome.storage.local.remove(['authToken', 'authUser'], () => {
                  setUser(null);
                  toast.info('Logged out');
                });
              } else {
                setUser(null);
                toast.info('Logged out');
              }
            }}
          >
            <LogOut size={14} />
          </Button>
        )}
      </div>

      {tab === 'pins' ? (
        <PinPanel className="flex-1 min-h-0" />
      ) : (
        <GalleryPanel
          images={images}
          onImagesChange={handleImagesChange}
          dragMode={dragMode}
          emptyHint="Saved downloads appear here. Multi-select, then drag into the editor or a page input."
          className="flex-1 min-h-0"
        />
      )}
    </div>
  );
}
