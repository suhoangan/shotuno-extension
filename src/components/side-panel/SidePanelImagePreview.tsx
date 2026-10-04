import { X, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { getFullImage } from '../../lib/galleryDb';
import { getPinFullImage } from '../../lib/pinDb';
import { useTranslation } from '../../lib/i18n';

interface SidePanelImagePreviewProps {
	imageId: string;
	onClose: () => void;
	onExpand: (imageId: string) => void;
}

export function SidePanelImagePreview({
	imageId,
	onClose,
	onExpand,
}: SidePanelImagePreviewProps) {
	const { t } = useTranslation();
	const [dataUrl, setDataUrl] = useState<string | null>(null);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		let isMounted = true;
		setHasError(false);
		async function fetchUrl() {
			try {
				let url = await getFullImage(imageId);
				if (!url) {
					url = await getPinFullImage(imageId);
				}
				if (!isMounted) return;
				if (url) {
					setDataUrl(url);
				} else {
					setHasError(true);
				}
			} catch {
				if (isMounted) setHasError(true);
			}
		}
		void fetchUrl();
		return () => {
			isMounted = false;
		};
	}, [imageId]);

	return (
		<div className='absolute inset-0 z-50 bg-background/50 backdrop-blur-[2px] flex items-center justify-center p-4'>
			<div className='w-full max-h-full bg-background border border-border rounded-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-200'>
				<div className='flex items-center justify-between p-2 border-b border-border bg-muted/50'>
					<span className='text-sm font-medium text-foreground px-2 truncate'>
						{t('sidepanel.preview')}
					</span>
					<div className='flex items-center gap-1'>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 text-muted-foreground hover:text-foreground'
							onClick={() => onExpand(imageId)}
							title={t('sidepanel.expand')}
						>
							<Maximize2 size={16} />
						</Button>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 text-muted-foreground hover:text-foreground'
							onClick={onClose}
						>
							<X size={16} />
						</Button>
					</div>
				</div>
				<div className='overflow-hidden p-4 flex items-center justify-center min-h-0'>
					{dataUrl ? (
						<img
							src={dataUrl}
							alt={t('sidepanel.preview')}
							className='max-w-full max-h-full object-contain rounded-md shadow-sm border border-border'
						/>
					) : hasError ? (
						<div className='text-destructive text-sm font-medium'>
							Image not found
						</div>
					) : (
						<div className='text-muted-foreground text-sm animate-pulse'>
							{t('sidepanel.loadingImage')}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
