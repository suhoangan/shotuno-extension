import { Circle, Square, MapPin, ListOrdered } from 'lucide-react';
import { StyleToggle } from './StyleToggle';
import { ICON } from './toolbarUi';
import { useTranslation } from '../../../lib/i18n';

interface CounterStyleControlsProps {
  counterStyle: 'circle' | 'square' | 'waterpoint';
  setCounterStyle: (style: 'circle' | 'square' | 'waterpoint', opts?: { persistToTool?: boolean }) => void;
  continueCounter: boolean;
  setContinueCounter: (continueCount: boolean, opts?: { persistToTool?: boolean }) => void;
  applyToSelection: (props: any) => void;
  persistOpts: { persistToTool: boolean };
}

export function CounterStyleControls({
  counterStyle,
  setCounterStyle,
  continueCounter,
  setContinueCounter,
  applyToSelection,
  persistOpts,
}: CounterStyleControlsProps) {
  const { t } = useTranslation();

  return (
    <>
      <StyleToggle
        label={t('toolbar.styles.circleBadge')}
        active={counterStyle === 'circle'}
        onClick={() => {
          setCounterStyle('circle', persistOpts);
          applyToSelection({ counterStyle: 'circle' });
        }}
      >
        <Circle size={ICON} />
      </StyleToggle>
      <StyleToggle
        label="Square Style"
        active={counterStyle === 'square'}
        onClick={() => {
          setCounterStyle('square', persistOpts);
          applyToSelection({ counterStyle: 'square' });
        }}
      >
        <Square size={ICON} />
      </StyleToggle>
      <StyleToggle
        label={t('toolbar.styles.pinBadge')}
        active={counterStyle === 'waterpoint'}
        onClick={() => {
          setCounterStyle('waterpoint', persistOpts);
          applyToSelection({ counterStyle: 'waterpoint' });
        }}
      >
        <MapPin size={ICON} />
      </StyleToggle>

      <div className="h-4 w-px shrink-0 bg-border/40" />

      <StyleToggle
        label={t('toolbar.styles.continueCount')}
        active={continueCounter}
        onClick={() => {
          setContinueCounter(!continueCounter, persistOpts);
        }}
      >
        <ListOrdered size={ICON} />
      </StyleToggle>

      <div className="h-4 w-px shrink-0 bg-border/40" />
    </>
  );
}
