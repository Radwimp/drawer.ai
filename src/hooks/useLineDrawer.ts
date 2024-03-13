import { useCallback, useState } from 'react';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';
import { Size } from '../enums';

export const sizes = {
  [Size.Small]: { width: 300, height: 200 },
  [Size.Medium]: { width: 600, height: 400 },
  [Size.Large]: { width: 900, height: 600 },
};

export const getPoint = (e: KonvaPointerEvent) => e.target.getStage()?.getRelativePointerPosition();

export default function useLineDrawer() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [size, setSize] = useState<Size>(Size.Large);
  const [lines, setLines] = useState<number[][]>([]);

  const { width, height } = sizes[size];
  const scaleX = sizes[size].width / sizes[Size.Large].width;
  const scaleY = sizes[size].height / sizes[Size.Large].height;

  const onMouseDown = useCallback(
    (e: KonvaPointerEvent) => {
      const point = getPoint(e);

      if (!point) {
        return;
      }

      setIsDrawing(true);
      setLines([...lines, [point.x, point.y]]);
    },
    [lines],
  );

  const onMousemove = useCallback(
    (e: KonvaPointerEvent) => {
      const point = getPoint(e);

      if (!point || !isDrawing) {
        return;
      }

      const [startX, startY] = lines.at(-1)!;
      const newLine =
        Math.abs(point.x - startX) > Math.abs(point.y - startY)
          ? [startX, startY, point.x, startY]
          : [startX, startY, startX, point.y];

      setLines([...lines.slice(0, -1), newLine]);
    },
    [isDrawing, lines],
  );

  const onMouseup = () => setIsDrawing(false);
  const changeSize = (newSize: Size) => setSize(newSize);

  return {
    lines,
    width,
    height,
    scaleX,
    scaleY,
    onMouseDown,
    onMousemove,
    onMouseup,
    changeSize,
  };
}
