import { Check, LayoutGrid, Cloud } from 'lucide-react';
import { Button } from '../ui/button';
import type { GalleryImage } from '../../lib/galleryDb';
import type { GalleryViewMode } from './galleryPrefs';
import { formatGalleryDate } from './galleryPrefs';

interface GalleryItemProps {
	image: GalleryImage;
	selected: boolean;
	view: GalleryViewMode;
	selectedCount: number;
	/** When true, clicking the card toggles selection instead of opening preview. */
	selectMode: boolean;
	onToggleSelect: () => void;
	onPreview: () => void;
	onDelete: () => void;
	onDragStart: (e: React.DragEvent) => void;
	draggable?: boolean;
	dragHint?: string;
	menu?: React.ReactNode;
}

export function GalleryItem({
	image,
	selected,
	view,
	selectedCount,
	selectMode,
	onToggleSelect,
	onPreview,
	onDragStart,
	draggable = true,
	dragHint = 'Drag to use',
	menu,
}: GalleryItemProps) {
	const label = image.filename || `Shot ${image.id.slice(-4)}`;
	const multiHint =
		selected && selectedCount > 1 ? `Drag ${selectedCount}` : dragHint;

	const handleCardClick = (e: React.MouseEvent) => {
		// Action buttons stopPropagation; anything else hits the card.
		if ((e.target as HTMLElement).closest('[data-item-action]')) return;
		if (selectMode) {
			onToggleSelect();
			return;
		}
		onPreview();
	};

	if (view === 'list') {
		return (
			<div
				role='button'
				tabIndex={0}
				draggable={draggable}
				onDragStart={onDragStart}
				onClick={handleCardClick}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						if (selectMode) onToggleSelect();
						else onPreview();
					}
				}}
				className={`group flex items-center gap-2 rounded-lg border p-1.5 transition-colors ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
					selected
						? 'border-primary bg-primary/5'
						: 'border-border/60 hover:border-border hover:bg-muted/40'
				}`}
			>
				<Button
					type='button'
					size='icon'
					variant={selected ? 'default' : 'outline'}
					data-item-action
					onClick={(e) => {
						e.stopPropagation();
						onToggleSelect();
					}}
					className={`shrink-0 w-5 h-5 rounded-md p-0 transition-colors ${
						selected
							? 'bg-primary border-primary text-primary-foreground'
							: 'border-border bg-background'
					}`}
					aria-label={selected ? 'Deselect' : 'Select'}
				>
					{selected && <Check size={12} />}
				</Button>
				<div className='shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border pointer-events-none p-0.5'>
					<img
						src={image.url}
						alt={label}
						className='w-full h-full object-contain rounded-[4px]'
					/>
				</div>
				<div className='flex-1 min-w-0 text-left pointer-events-none'>
					<p className='text-xs font-medium text-foreground truncate flex items-center gap-1'>
						{label}
						{image.batchId && (
							<span title='Grid Batch'>
								<LayoutGrid
									size={10}
									className='text-muted-foreground inline'
								/>
							</span>
						)}
						{image.cloudUrl && (
							<span title='Synced'>
								<Cloud
									size={10}
									className='text-muted-foreground inline'
								/>
							</span>
						)}
					</p>
					<p className='text-[10px] text-muted-foreground'>
						{formatGalleryDate(image.timestamp)}
					</p>
				</div>
				{menu}
			</div>
		);
	}

	return (
		<div
			role='button'
			tabIndex={0}
			draggable={draggable}
			onDragStart={onDragStart}
			onClick={handleCardClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					if (selectMode) onToggleSelect();
					else onPreview();
				}
			}}
			className={`group relative aspect-square rounded-xl border overflow-hidden transition-all ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
				selected
					? 'border-primary ring-2 ring-primary/30'
					: 'border-border/60 hover:border-border hover:shadow-sm'
			}`}
		>
			<div className='w-full h-full bg-card pointer-events-none'>
				<img
					src={image.url}
					alt={label}
					className='w-full h-full object-contain'
				/>
			</div>
			<Button
				type='button'
				size='icon'
				variant={selected ? 'default' : 'outline'}
				data-item-action
				onClick={(e) => {
					e.stopPropagation();
					onToggleSelect();
				}}
				className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-md p-0 shadow-sm transition-colors ${
					selected
						? 'bg-primary border-primary text-primary-foreground'
						: `bg-background/80 border-border ${selectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`
				}`}
				aria-label={selected ? 'Deselect' : 'Select'}
			>
				{selected && <Check size={12} />}
			</Button>
			{draggable && (
				<div className='absolute inset-x-0 bottom-1.5 px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
					<p className='text-xs font-medium text-foreground truncate drop-shadow-sm bg-background/80 px-2 py-1 rounded-md inline-block border border-border shadow-sm'>
						{multiHint}
					</p>
				</div>
			)}

			{menu}
			{image.cloudUrl && (
				<div
					className={`absolute bottom-1.5 ${image.batchId ? 'right-9' : 'right-1.5'} z-10 h-6 px-1.5 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground shadow-sm pointer-events-none`}
					title='Synced'
				>
					<Cloud size={12} />
				</div>
			)}
		</div>
	);
}
