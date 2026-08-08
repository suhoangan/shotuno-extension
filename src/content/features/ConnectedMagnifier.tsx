import { useEditorStore } from '../../store/useEditorStore';
import { MagnifierShape } from '../components/canvas/shapes/MagnifierShape';
import type { ShapeRenderProps } from './types';

export function ConnectedMagnifier(props: ShapeRenderProps) {
  const allShapes = useEditorStore((s) => s.shapes);
  return (
    <MagnifierShape
      shape={props.shape as any}
      commonProps={props.commonProps}
      bgImage={props.bgImage}
      allShapes={allShapes}
      renderShape={(s) => props.renderChild?.(s) ?? null}
    />
  );
}
