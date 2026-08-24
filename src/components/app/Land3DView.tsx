import { useRef, useState } from "react";
import { Box, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  surveyNumber: string;
  areaExtent?: string | null;
  location?: string | null;
  riskLevel?: string | null;
};

const RISK_SURFACE: Record<string, string> = {
  HIGH: "bg-risk-high/70",
  MEDIUM: "bg-risk-medium/70",
  LOW: "bg-risk-low/70",
};

/**
 * A lightweight CSS 3D visualisation of the land parcel referenced by a survey
 * number. It is an indicative block model (not a surveyed cadastral map).
 */
export function Land3DView({ surveyNumber, areaExtent, location, riskLevel }: Props) {
  const [rotX, setRotX] = useState(58);
  const [rotZ, setRotZ] = useState(-32);
  const drag = useRef<{ x: number; y: number; rotX: number; rotZ: number } | null>(null);

  const surface = RISK_SURFACE[(riskLevel ?? "LOW").toUpperCase()] ?? "bg-primary/60";

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, rotX, rotZ };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setRotZ(drag.current.rotZ + dx * 0.4);
    setRotX(Math.min(88, Math.max(15, drag.current.rotX - dy * 0.3)));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="space-y-3">
      <div
        className="relative h-[340px] cursor-grab touch-none overflow-hidden rounded-xl border bg-gradient-to-b from-secondary/60 to-background active:cursor-grabbing"
        style={{ perspective: "900px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
          }}
        >
          {/* ground grid */}
          <div
            className="absolute -left-[220px] -top-[170px] h-[340px] w-[440px] rounded-md border border-border/70 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              transform: "translateZ(0px)",
            }}
          />

          {/* parcel block: top face + 4 walls, extruded 44px */}
          <div className="absolute" style={{ transformStyle: "preserve-3d" }}>
            <div
              className={`absolute -left-[110px] -top-[75px] flex h-[150px] w-[220px] items-center justify-center rounded-sm border-2 border-foreground/40 ${surface} shadow-lg`}
              style={{ transform: "translateZ(44px)" }}
            >
              <span
                className="text-xs font-semibold tracking-wide text-foreground"
                style={{ transform: `rotateZ(${-rotZ}deg)` }}
              >
                Survey {surveyNumber}
              </span>
            </div>
            {[
              { t: "rotateX(90deg) translate3d(0px, -22px, 75px)", w: 220, h: 44 },
              { t: "rotateX(90deg) translate3d(0px, -22px, -75px)", w: 220, h: 44 },
              { t: "rotateY(90deg) rotateX(90deg) translate3d(0px, -22px, 110px)", w: 150, h: 44 },
              { t: "rotateY(90deg) rotateX(90deg) translate3d(0px, -22px, -110px)", w: 150, h: 44 },
            ].map((face, i) => (
              <div
                key={i}
                className="absolute border border-foreground/30 bg-muted-foreground/40"
                style={{
                  width: face.w,
                  height: face.h,
                  left: -face.w / 2,
                  top: -face.h / 2,
                  transform: face.t,
                }}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          Drag to rotate · indicative 3D block model
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Box className="size-3.5 text-primary" /> Survey {surveyNumber}
          </span>
          {areaExtent && <span>Extent: {areaExtent}</span>}
          {location && <span>{location}</span>}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRotX(58);
            setRotZ(-32);
          }}
        >
          <RotateCcw className="size-3.5" /> Reset view
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        This 3D block is generated from the survey number and extent mentioned in the article. It is an indicative
        visualisation, not an official cadastral survey map.
      </p>
    </div>
  );
}
