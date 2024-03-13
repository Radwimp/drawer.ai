import { describe, expect, mock, test } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import useLineDrawer, { sizes, getPoint } from './useLineDrawer';
import { Size } from '../enums';
import type { KonvaPointerEvent } from 'konva/lib/PointerEvents';

const zeroPointEvent = {
  target: { getStage: () => ({ getRelativePointerPosition: () => ({ x: 0, y: 0 }) }) },
} as KonvaPointerEvent;
const nullPointEvent = {
  target: { getStage: () => ({ getRelativePointerPosition: () => null }) },
} as KonvaPointerEvent;

describe('useLineDrawer', () => {
  test('default value matches Large size params', () => {
    const {
      result: {
        current: { width, height, scaleX, scaleY, lines },
      },
    } = renderHook(() => useLineDrawer());

    expect(width).toBe(sizes[Size.Large].width);
    expect(height).toBe(sizes[Size.Large].height);
    expect(scaleX).toBe(1);
    expect(scaleY).toBe(1);
    expect(lines).toBeArrayOfSize(0);
  });

  test('getPoint calls getRelativePointerPosition', () => {
    const spy = mock();

    //@ts-expect-error mock
    act(() => getPoint({ target: { getStage: () => ({ getRelativePointerPosition: spy }) } }));

    expect(spy).toHaveBeenCalled();
  });

  test('changeSize works', () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.changeSize(Size.Small));

    expect(result.current.width).toBe(sizes[Size.Small].width);
    expect(result.current.height).toBe(sizes[Size.Small].height);
    expect(result.current.scaleX).toBe(1 / 3);
    expect(result.current.scaleY).toBe(1 / 3);

    act(() => result.current.changeSize(Size.Medium));

    expect(result.current.width).toBe(sizes[Size.Medium].width);
    expect(result.current.height).toBe(sizes[Size.Medium].height);
    expect(result.current.scaleX).toBe(2 / 3);
    expect(result.current.scaleY).toBe(2 / 3);
  });

  test('onMouseDown works', () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMouseDown(zeroPointEvent));

    expect(result.current.lines).toBeArrayOfSize(1);
    expect(result.current.lines.at(0)).toEqual([0, 0]);
  });

  test("onMouseDown doesn't add a line if there is no point", () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMouseDown(nullPointEvent));

    expect(result.current.lines).toBeEmpty();
  });

  test('onMousemove works', () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMouseDown(zeroPointEvent));
    act(() => result.current.onMousemove(zeroPointEvent));

    expect(result.current.lines).toBeArrayOfSize(1);
    expect(result.current.lines.at(0)).toEqual([0, 0, 0, 0]);
  });

  test("onMousemove doesn't work if there is no point", () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMouseDown(zeroPointEvent));
    act(() => result.current.onMousemove(nullPointEvent));

    expect(result.current.lines).toBeArrayOfSize(1);
    expect(result.current.lines.at(0)).toEqual([0, 0]);
  });

  test("onMousemove doesn't work if onMouseDown has not been called", () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMousemove(zeroPointEvent));

    expect(result.current.lines).toBeEmpty();
  });

  test('onMouseup works', () => {
    const { result } = renderHook(() => useLineDrawer());

    act(() => result.current.onMouseDown(zeroPointEvent));
    act(() => result.current.onMousemove(zeroPointEvent));
    act(() => result.current.onMouseup());

    expect(result.current.lines).toBeArrayOfSize(1);
    expect(result.current.lines.at(0)).toEqual([0, 0, 0, 0]);
  });

  test('lines can only be straight', () => {
    const { result } = renderHook(() => useLineDrawer());
    const testPointEvent = {
      target: { getStage: () => ({ getRelativePointerPosition: () => ({ x: 4, y: 2 }) }) },
    } as KonvaPointerEvent;
    const anotherTestPointEvent = {
      target: { getStage: () => ({ getRelativePointerPosition: () => ({ x: 4, y: 12 }) }) },
    } as KonvaPointerEvent;

    act(() => result.current.onMouseDown(zeroPointEvent));
    act(() => result.current.onMousemove(testPointEvent));
    act(() => result.current.onMouseup());

    act(() => result.current.onMouseDown(zeroPointEvent));
    act(() => result.current.onMousemove(anotherTestPointEvent));
    act(() => result.current.onMouseup());

    expect(result.current.lines).toBeArrayOfSize(2);
    expect(result.current.lines.at(0)).toEqual([0, 0, 4, 0]);
    expect(result.current.lines.at(1)).toEqual([0, 0, 0, 12]);
  });
});
