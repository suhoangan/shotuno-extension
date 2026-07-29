/** Recompute transformer bounds after a node's geometry was baked/normalized. */
export function refreshTransformersForNode(node: any) {
  const stage = node.getStage?.();
  if (!stage) return;

  stage.find('Transformer').forEach((tr: any) => {
    if (tr.nodes().includes(node)) {
      tr.forceUpdate();
      tr.getLayer()?.batchDraw();
    }
  });
}

export function getActiveTransformerAnchor(node: any): string | null {
  const stage = node.getStage?.();
  if (!stage) return null;

  for (const tr of stage.find('Transformer')) {
    if (tr.nodes().includes(node)) {
      return tr.getActiveAnchor?.() ?? null;
    }
  }

  return null;
}
