/** Map a mouse/touch event to image-space coordinates on the Konva stage. */
export function getStagePointerPos(
  stageRef: React.RefObject<any>,
  scale: number,
  bounds: { x: number; y: number },
  e: any,
) {
  const evt = e?.evt || e;
  if (!stageRef.current || !evt) return { x: 0, y: 0 };
  const stageBox = stageRef.current.container().getBoundingClientRect();
  const clientX = evt.touches?.length > 0 ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches?.length > 0 ? evt.touches[0].clientY : evt.clientY;
  const stageX = stageRef.current.x();
  const stageY = stageRef.current.y();
  return {
    x: (clientX - stageBox.left - stageX) / scale + bounds.x,
    y: (clientY - stageBox.top - stageY) / scale + bounds.y,
  };
}
