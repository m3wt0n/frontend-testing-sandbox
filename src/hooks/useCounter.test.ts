import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
	it("初期値を指定しない場合、count は 0 から始まる", () => {
		const { result } = renderHook(() => useCounter());
		expect(result.current.count).toBe(0);
	});

	it("initialValue を指定すると、その値から始まる", () => {
		const { result } = renderHook(() => useCounter(10));
		expect(result.current.count).toBe(10);
	});

	it("increment を呼ぶと count が 1 増える", () => {
		const { result } = renderHook(() => useCounter());
		act(() => result.current.increment());
		expect(result.current.count).toBe(1);
	});

	it("decrement を呼ぶと count が 1 減る", () => {
		const { result } = renderHook(() => useCounter(5));
		act(() => result.current.decrement());
		expect(result.current.count).toBe(4);
	});

	it("reset を呼ぶと initialValue に戻る", () => {
		const { result } = renderHook(() => useCounter(3));
		act(() => result.current.increment());
		act(() => result.current.increment());
		act(() => result.current.reset());
		expect(result.current.count).toBe(3);
	});

	it("0 未満にも decrement できる", () => {
		const { result } = renderHook(() => useCounter(0));
		act(() => result.current.decrement());
		expect(result.current.count).toBe(-1);
	});
});
