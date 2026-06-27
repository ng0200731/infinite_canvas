"use client";

import { type NodeProps } from "@xyflow/react";

import { NODE_PORT_COLORS } from "@/lib/nodes/ports";
import type { NoteCanvasNode } from "@/lib/nodes/types";
import { useCanvasActions } from "../canvas-context";
import { NodeDeleteButton } from "./delete-button";
import { InputPort, OutputPort } from "./port";

export function NoteNode({ id, data }: NodeProps<NoteCanvasNode>) {
  const { updateNodeData } = useCanvasActions();

  return (
    <div className="group relative w-56 rounded-md border border-amber-200 bg-amber-50 p-2 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
      <NodeDeleteButton id={id} />
      <InputPort color={NODE_PORT_COLORS.note} />
      <textarea
        rows={4}
        placeholder="Type a note…"
        value={data.text}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-amber-800/40 dark:placeholder:text-amber-200/40"
      />
      <OutputPort color={NODE_PORT_COLORS.note} />
    </div>
  );
}
