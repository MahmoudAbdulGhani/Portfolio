import { useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';

type Point = { x: number; y: number };
export type InspectionMode = 'fit' | 'width' | 'actual' | 'zoom';
export function useImageInspection(region: RefObject<HTMLDivElement | null>, source: string, geometry: { width: number; height: number }) {
  const [state, setState] = useState({ source, mode: 'fit' as InspectionMode, scale: 1 });
  const view = state.source === source ? state : { source, mode: 'fit' as InspectionMode, scale: 1 };
  const points = useRef(new Map<number, Point>());
  const anchor = useRef<{ x: number; y: number; point: Point } | null>(null);
  useLayoutEffect(() => {
    const node = region.current;
    const retire = () => {
      for (const id of points.current.keys()) if (node?.hasPointerCapture(id)) node.releasePointerCapture(id);
      points.current.clear();
    };
    retire();
    return retire;
  }, [source, region]);
  const scale = () => {
    const node = region.current;
    if (!node) return 1;
    return view.mode === 'fit' ? Math.min(1, node.clientWidth / geometry.width, node.clientHeight / geometry.height)
      : view.mode === 'width' ? node.clientWidth / geometry.width : view.mode === 'actual' ? 1 : view.scale;
  };
  const zoomAt = (factor: number, point?: Point) => {
    const node = region.current;
    if (!node) return;
    const at = point ?? { x: node.clientWidth / 2, y: node.clientHeight / 2 };
    const before = scale();
    const minimum = Math.min(1, node.clientWidth / geometry.width, node.clientHeight / geometry.height);
    const next = Math.max(minimum, Math.min(4, before * factor));
    const left = view.mode === 'fit' ? (node.clientWidth - geometry.width * before) / 2 : 0;
    const top = view.mode === 'fit' ? (node.clientHeight - geometry.height * before) / 2 : 0;
    anchor.current = { x: (node.scrollLeft + at.x - left) / before, y: (node.scrollTop + at.y - top) / before, point: at };
    setState({ source, mode: 'zoom', scale: next });
  };
  useLayoutEffect(() => {
    const node = region.current, target = anchor.current;
    if (!node) return;
    if (target && view.mode === 'zoom') node.scrollTo(target.x * view.scale - target.point.x, target.y * view.scale - target.point.y);
    else node.scrollTo(0, 0);
    anchor.current = null;
  }, [source, view.mode, view.scale, region]);
  const setMode = (mode: InspectionMode) => {
    points.current.clear(); anchor.current = null;
    setState({ source, mode, scale: 1 });
  };
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && (event.button !== 0 || view.mode === 'fit')) return;
    if ((event.target as HTMLElement).closest('button')) return;
    if (!points.current.size) event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    points.current.set(event.pointerId, point(event));
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = points.current.get(event.pointerId);
    if (!previous) return;
    const old = [...points.current.values()];
    const next = point(event);
    points.current.set(event.pointerId, next);
    const values = [...points.current.values()];
    if (values.length === 2) {
      const distance = (list: Point[]) => Math.hypot(list[1].x - list[0].x, list[1].y - list[0].y);
      const centre = { x: (values[0].x + values[1].x) / 2, y: (values[0].y + values[1].y) / 2 };
      if (distance(old) > 0) zoomAt(distance(values) / distance(old), centre);
    } else if (view.mode !== 'fit') {
      event.currentTarget.scrollBy(previous.x - next.x, previous.y - next.y);
    }
  };
  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => { points.current.delete(event.pointerId); };
  return { mode: view.mode, factor: view.scale, setMode, zoomAt, gestures: { onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerEnd, onPointerCancel: pointerEnd, onLostPointerCapture: pointerEnd } };
}
