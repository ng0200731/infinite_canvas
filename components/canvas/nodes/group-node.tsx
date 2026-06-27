"use client";

import { type NodeProps } from "@xyflow/react";

import { NODE_PORT_COLORS } from "@/lib/nodes/ports";
import type { GroupCanvasNode } from "@/lib/nodes/types";
import { useCanvasActions } from "../canvas-context";
import { NodeDeleteButton } from "./delete-button";
import { InputPort, OutputPort } from "./port";

export function GroupNode({ id, data }: NodeProps<GroupCanvasNode>) {
  const { updateNodeData } = useCanvasActions();

  return (
    <div className="group border-border bg-muted/20 relative h-48 w-80 rounded-lg border-2 border-dashed p-2">
      <NodeDeleteButton id={id} />
      <InputPort color={NODE_PORT_COLORS.group} />
      <input
        value={data.label}
        placeholder="Group label"
        onChange={(e) => updateNodeData(id, { label: e.target.value })}
        className="text-muted-foreground placeholder:text-muted-foreground/50 w-full bg-transparent text-xs font-medium tracking-wide uppercase outline-none"
      />
      <OutputPort color={NODE_PORT_COLORS.group} />
    </div>
  );
}
