import { describe, it, expect } from "vitest";
import { generateLessonForLearningGoal } from "./generateLessonForLearningGoal";
import type { LearningGoal } from "@/entities/LearningGoal";
import type { UnitOfMeaning } from "@/entities/UnitOfMeaning";

describe("generateLessonForLearningGoal", () => {
  const mockGetUnitOfMeaning = (uid: string): UnitOfMeaning | undefined => {
    const mockUnits: Record<string, UnitOfMeaning> = {
      "unit1": {
        uid: "unit1",
        language: "en",
        content: "hello",
        linguType: "word",
        translations: ["unit2"],
        userCreated: false,
        context: "test"
      },
      "unit2": {
        uid: "unit2",
        language: "de",
        content: "hallo",
        linguType: "word",
        translations: ["unit1"],
        userCreated: false,
        context: "test"
      },
      "unit3": {
        uid: "unit3",
        language: "en",
        content: "I have a cat",
        linguType: "sentence",
        translations: ["unit4"],
        userCreated: false,
        context: "test"
      },
      "unit4": {
        uid: "unit4",
        language: "de",
        content: "Ich habe eine Katze",
        linguType: "sentence",
        translations: ["unit3"],
        userCreated: false,
        context: "test"
      }
    };
    return mockUnits[uid];
  };

  const mockLearningGoal: LearningGoal = {
    uid: "goal1",
    name: "Test Goal",
    parents: [],
    blockedBy: [],
    language: "en",
    unitsOfMeaning: ["unit1", "unit2", "unit3", "unit4"],
    userCreated: false
  };

  it("should generate exercises for a learning goal", () => {
    const exercises = generateLessonForLearningGoal(
      mockLearningGoal,
      [
        mockGetUnitOfMeaning("unit1")!,
        mockGetUnitOfMeaning("unit2")!,
        mockGetUnitOfMeaning("unit3")!,
        mockGetUnitOfMeaning("unit4")!
      ],
      "de",
      mockGetUnitOfMeaning
    );

    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.length).toBeLessThanOrEqual(20);
  });

  it("should generate deterministic UIDs", () => {
    const exercises1 = generateLessonForLearningGoal(
      mockLearningGoal,
      [
        mockGetUnitOfMeaning("unit1")!,
        mockGetUnitOfMeaning("unit2")!
      ],
      "de",
      mockGetUnitOfMeaning
    );

    const exercises2 = generateLessonForLearningGoal(
      mockLearningGoal,
      [
        mockGetUnitOfMeaning("unit1")!,
        mockGetUnitOfMeaning("unit2")!
      ],
      "de",
      mockGetUnitOfMeaning
    );

    // The UIDs should be deterministic (same input = same UIDs)
    const uids1 = exercises1.map(e => e.uid).sort();
    const uids2 = exercises2.map(e => e.uid).sort();
    expect(uids1).toEqual(uids2);
  });

  it("should generate readable UIDs", () => {
    const exercises = generateLessonForLearningGoal(
      mockLearningGoal,
      [
        mockGetUnitOfMeaning("unit1")!,
        mockGetUnitOfMeaning("unit2")!
      ],
      "de",
      mockGetUnitOfMeaning
    );

    exercises.forEach(exercise => {
      expect(exercise.uid).toMatch(/^(std_fwd_|std_rev_|cloze_).*/);
    });
  });
}); 