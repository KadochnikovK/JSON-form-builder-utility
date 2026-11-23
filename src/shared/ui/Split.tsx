import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

const clampRatio = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function useDragRatio(axis: 'x' | 'y', initial: number, min: number, max: number) {
  const [ratio, setRatio] = useState(initial);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      const apply = (clientX: number, clientY: number) => {
        const rect = nodeRef.current?.getBoundingClientRect();
        if (!rect || rect.height === 0 || rect.width === 0) return;
        const raw =
          axis === 'y'
            ? (clientY - rect.top) / rect.height
            : (clientX - rect.left) / rect.width;
        setRatio(clampRatio(raw, min, max));
      };
      apply(e.clientX, e.clientY);
      const move = (ev: PointerEvent) => apply(ev.clientX, ev.clientY);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        document.body.style.userSelect = '';
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      document.body.style.userSelect = 'none';
    },
    [axis, min, max],
  );

  useEffect(() => {
    setRatio((prev) => clampRatio(prev, min, max));
  }, [min, max]);

  return { ratio, containerRef: nodeRef, onPointerDown };
}

interface VSplitProps {
  first: ReactNode;
  second: ReactNode;
  initial?: number;
  min?: number;
  max?: number;
}

export function VSplit({ first, second, initial = 0.55, min = 0.2, max = 0.8 }: VSplitProps) {
  const { ratio, containerRef, onPointerDown } = useDragRatio('y', initial, min, max);
  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full flex-col">
      <div style={{ height: `${ratio * 100}%` }} className="min-h-0 overflow-hidden">
        {first}
      </div>
      <div
        onPointerDown={onPointerDown}
        className="group flex h-1.5 shrink-0 cursor-row-resize items-center justify-center bg-zinc-200/60 hover:bg-blue-200"
      >
        <div className="h-0.5 w-10 rounded-full bg-zinc-400 group-hover:bg-blue-500" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{second}</div>
    </div>
  );
}

interface HSplitProps {
  first: ReactNode;
  second: ReactNode;
  initial?: number;
  min?: number;
  max?: number;
}

export function HSplit({ first, second, initial = 0.5, min = 0.2, max = 0.8 }: HSplitProps) {
  const { ratio, containerRef, onPointerDown } = useDragRatio('x', initial, min, max);
  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full flex-row">
      <div style={{ width: `${ratio * 100}%` }} className="min-h-0 min-w-0 overflow-hidden">
        {first}
      </div>
      <div
        onPointerDown={onPointerDown}
        className="group flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-zinc-200/60 hover:bg-blue-200"
      >
        <div className="h-10 w-0.5 rounded-full bg-zinc-400 group-hover:bg-blue-500" />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{second}</div>
    </div>
  );
}
