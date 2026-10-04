import { FileText, List, Type, type LucideIcon } from 'lucide-react';

export const SEND_TO_AI_PRESET_IDS = ['explain', 'summarize', 'extractText'] as const;

export type SendToAIPresetId = (typeof SEND_TO_AI_PRESET_IDS)[number];

export const SEND_TO_AI_PRESET_ICONS: Record<SendToAIPresetId, LucideIcon> = {
  explain: Type,
  summarize: List,
  extractText: FileText,
};
