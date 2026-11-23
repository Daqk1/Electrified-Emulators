import {
  getPinAbsolutePosition,
  getPinOutwardDirection,
  getWireObstacles,
  routeCircuitWires,
  routeWire,
} from "../core/geometry";
import type { CircuitState, EditorState, Selection } from "../core/types";
import { ComponentSymbol } from "./ComponentSymbol";
import { Wire } from "./Wire";
import { WirePreview } from "./WirePreview";
import type { RenderVariant } from "./parts/shared";

export function CircuitScene({
  circuit,
  selection = null,
  wiring = null,
  variant = "canvas",
}: {
  circuit: CircuitState;
  selection?: Selection;
  wiring?: EditorState["wiring"];
  variant?: RenderVariant;
}) {
  const previewFrom =
    variant === "canvas" && wiring
      ? getPinAbsolutePosition(circuit, wiring.from)
      : null;
  const previewTo = wiring?.hoverPin
    ? (getPinAbsolutePosition(circuit, wiring.hoverPin) ?? wiring.preview)
    : wiring?.preview;
  const obstacles = getWireObstacles(circuit);
  const obstacleByComponentId = new Map(circuit.components.map((component, index) => [component.id, obstacles[index]]));
  const routedWires = routeCircuitWires(circuit, obstacles);
  const occupiedSegments = routedWires.flatMap((wire) => wire.segments);
  const previewPath = previewFrom && previewTo && wiring
    ? routeWire(
      previewFrom,
      previewTo,
      obstacles,
      getPinOutwardDirection(circuit, wiring.from) ?? undefined,
      wiring.hoverPin ? getPinOutwardDirection(circuit, wiring.hoverPin) ?? undefined : undefined,
      occupiedSegments,
      {
        from: obstacleByComponentId.get(wiring.from.compId),
        to: wiring.hoverPin ? obstacleByComponentId.get(wiring.hoverPin.compId) : undefined,
      },
    ).path
    : undefined;
  return (
    <>
      <g data-layer="wires">
        {routedWires.map(({ wire, from, to, path }) => (
          <Wire
            key={wire.id}
            id={wire.id}
            from={from}
            to={to}
            pathData={path}
            variant={variant}
            selected={selection?.type === "wire" && selection.id === wire.id}
          />
        ))}
      </g>
      {variant === "canvas" && (
        <g data-layer="preview">
          {previewFrom && previewTo && (
            <WirePreview
              from={previewFrom}
              to={previewTo}
              {...(previewPath !== undefined ? { pathData: previewPath } : {})}
            />
          )}
        </g>
      )}
      <g data-layer="components">
        {circuit.components.map((component) => (
          <ComponentSymbol
            key={component.id}
            component={component}
            variant={variant}
            selected={
              selection?.type === "component" && selection.id === component.id
            }
            {...(variant === "canvas" &&
            wiring?.hoverPin?.compId === component.id
              ? { hoverPinId: wiring.hoverPin.pinId }
              : {})}
          />
        ))}
      </g>
    </>
  );
}
