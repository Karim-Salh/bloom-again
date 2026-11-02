import { describe, expect, it } from "vitest";
import { scoreEpds, itemScore } from "./epds";

describe("EPDS scoring", () => {
  it("scores items 1 top option as 0 and item 3 top option as 3", () => {
    expect(itemScore(0, 0)).toBe(0);
    expect(itemScore(2, 0)).toBe(3);
  });
  it("all-best answers score 0 with no safety flag", () => {
    expect(scoreEpds([0, 0, 3, 0, 3, 3, 3, 3, 3, 3])).toEqual({ total: 0, safety: false, level: "low" });
  });
  it("triggers safety when question 10 scores above 0", () => {
    expect(scoreEpds([0, 0, 3, 0, 3, 3, 3, 3, 3, 2]).safety).toBe(true);
  });
  it("13 or more is likely depression", () => {
    expect(scoreEpds([3, 3, 0, 3, 0, 3, 3, 3, 3, 3]).level).toBe("likely");
  });
  it("10-12 is possible", () => {
    expect(scoreEpds([2, 2, 1, 2, 1, 3, 3, 3, 3, 3]).total).toBe(10);
    expect(scoreEpds([2, 2, 1, 2, 1, 3, 3, 3, 3, 3]).level).toBe("possible");
  });
});
