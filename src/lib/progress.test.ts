import { describe, expect, it } from "vitest";
import { epdsRowForUser, moodRowForUser } from "./progress";

describe("user-owned progress rows", () => {
  it("attaches mood entries only to the signed-in user's id", () => {
    expect(moodRowForUser("mother-123", { date: "2026-11-10", mood: "calm", energy: 4, note: "" })).toEqual({
      user_id: "mother-123",
      entry_date: "2026-11-10",
      mood: "calm",
      energy: 4,
      note: "",
    });
  });

  it("attaches screening history only to the signed-in user's id", () => {
    expect(epdsRowForUser("mother-456", { date: "2026-11-10T20:00:00.000Z", total: 8, safety: false })).toEqual({
      user_id: "mother-456",
      recorded_at: "2026-11-10T20:00:00.000Z",
      total: 8,
      safety: false,
    });
  });
});