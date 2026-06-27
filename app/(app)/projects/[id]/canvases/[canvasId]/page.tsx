import { CanvasEditor } from "@/components/canvas/canvas-editor";

export default async function CanvasEditorPage({
  params,
}: {
  params: Promise<{ id: string; canvasId: string }>;
}) {
  const { id, canvasId } = await params;
  return <CanvasEditor projectId={id} canvasId={canvasId} />;
}
