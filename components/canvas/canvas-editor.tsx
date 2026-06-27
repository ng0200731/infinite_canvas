"use client";

import { useCallback, useEffect, useMemo, useRef, type DragEvent } from "react";
import Link from "next/link";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCanvas } from "@/lib/hooks/use-canvas";
import { getCanvasStore } from "@/lib/store";
import { createNode } from "@/lib/nodes/registry";
import { colorForNodeType, DEFAULT_EDGE_COLOR, EDGE_WIDTH } from "@/lib/nodes/ports";
import type { CanvasContent, CanvasEdge, CanvasNode, NodeType } from "@/lib/nodes/types";
import { CanvasActionsContext } from "./canvas-context";
import { NodePalette } from "./node-palette";
import { DeletableEdge } from "./edges/canvas-edge";
import { GenerateNode } from "./nodes/generate-node";
import { GroupNode } from "./nodes/group-node";
import { ImageNode } from "./nodes/image-node";
import { NoteNode } from "./nodes/note-node";

const AUTOSAVE_DEBOUNCE_MS = 600;

function Editor({ projectId, canvasId }: { projectId: string; canvasId: string }) {
  const { data: canvas, isLoading } = useCanvas(canvasId);
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>([]);
  const loadedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  // Load the canvas content once it arrives.
  useEffect(() => {
    if (canvas && !loadedRef.current) {
      loadedRef.current = true;
      setNodes(canvas.content.nodes);
      // Force the custom (deletable) edge type so the remove button renders.
      setEdges(canvas.content.edges.map((e) => ({ ...e, type: "deletable" })));
    }
  }, [canvas, setNodes, setEdges]);

  const updateNodeData = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  // Debounced autosave whenever nodes/edges change (after the initial load).
  useEffect(() => {
    if (!loadedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const content: CanvasContent = { nodes, edges };
      void getCanvasStore().saveCanvasContent(canvasId, content);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [nodes, edges, canvasId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // ComfyUI-style: color the wire to match its source port's node type.
      const source = getNodes().find((n) => n.id === connection.source);
      const color = colorForNodeType(source?.type);
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "deletable",
            style: { stroke: color, strokeWidth: EDGE_WIDTH },
          },
          eds,
        ),
      );
    },
    [setEdges, getNodes],
  );

  const spawnImageNode = useCallback(
    (parentId: string, url: string, meta: { prompt: string; model: string }) => {
      setNodes((nds) => {
        const parent = nds.find((n) => n.id === parentId);
        const position = parent
          ? { x: parent.position.x + 320, y: parent.position.y }
          : { x: 0, y: 0 };
        const node = createNode("image", position);
        node.data = { url };
        return nds.concat(node);
      });
      void getCanvasStore().recordImage({
        canvasId,
        source: "generated",
        url,
        prompt: meta.prompt,
        model: meta.model,
      });
    },
    [setNodes, canvasId],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      // Drop any wires that were attached to the removed node.
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  const deleteEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    },
    [setEdges],
  );

  const addNodeAtCenter = useCallback(
    (type: NodeType) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      setNodes((nds) => nds.concat(createNode(type, position)));
    },
    [screenToFlowPosition, setNodes],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/ica-node") as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setNodes((nds) => nds.concat(createNode(type, position)));
    },
    [screenToFlowPosition, setNodes],
  );

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      note: NoteNode,
      image: ImageNode,
      group: GroupNode,
      generate: GenerateNode,
    }),
    [],
  );

  // Smooth bezier links, color-matched to the source port (ComfyUI style).
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "deletable" as const,
      style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: EDGE_WIDTH },
    }),
    [],
  );

  const edgeTypes = useMemo<EdgeTypes>(() => ({ deletable: DeletableEdge }), []);

  const actions = useMemo(
    () => ({ updateNodeData, spawnImageNode, deleteNode, deleteEdge }),
    [updateNodeData, spawnImageNode, deleteNode, deleteEdge],
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Back to project"
          render={<Link href={`/projects/${projectId}`} />}
        >
          <ChevronLeft />
        </Button>
        {isLoading || !canvas ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <span className="text-sm font-medium">{canvas.name}</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <CanvasActionsContext.Provider value={actions}>
          <NodePalette onAdd={addNodeAtCenter} />
          <div className="relative flex-1" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
            {isLoading || !canvas ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                Loading canvas…
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodeOrigin={[0.5, 0.5]}
                connectionMode={ConnectionMode.Loose}
                connectionLineType={ConnectionLineType.Bezier}
                connectionLineStyle={{
                  stroke: DEFAULT_EDGE_COLOR,
                  strokeWidth: EDGE_WIDTH,
                }}
                defaultEdgeOptions={defaultEdgeOptions}
                deleteKeyCode={["Delete", "Backspace"]}
                fitView
                className="bg-muted/30"
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            )}
          </div>
        </CanvasActionsContext.Provider>
      </div>
    </div>
  );
}

export function CanvasEditor({ projectId, canvasId }: { projectId: string; canvasId: string }) {
  return (
    <ReactFlowProvider>
      <Editor projectId={projectId} canvasId={canvasId} />
    </ReactFlowProvider>
  );
}
