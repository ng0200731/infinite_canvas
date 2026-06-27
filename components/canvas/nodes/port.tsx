"use client";

import { Handle, Position } from "@xyflow/react";

/**
 * ComfyUI-style ports: inputs on the left, outputs on the right, rendered as
 * colored dots that match the node type's color. Used together with
 * `connectionMode="loose"` so you can drag from any port to any port.
 */
const BASE_STYLE = {
  width: 12,
  height: 12,
  border: "2px solid var(--color-card, #ffffff)",
} as const;

export function InputPort({ color, id }: { color: string; id?: string }) {
  return (
    <Handle
      id={id}
      type="target"
      position={Position.Left}
      isConnectable
      style={{ ...BASE_STYLE, background: color }}
    />
  );
}

export function OutputPort({ color, id }: { color: string; id?: string }) {
  return (
    <Handle
      id={id}
      type="source"
      position={Position.Right}
      isConnectable
      style={{ ...BASE_STYLE, background: color }}
    />
  );
}
