import { cvReviewChecks, cvReviewGroups, cvReviewProgress } from "../../src/data/cv-release-checklist";

describe("CV pre-submission review", () => {
  it("keeps a consistent, comprehensive editorial checklist", () => {
    expect(cvReviewChecks).toHaveLength(12);
    expect(new Set(cvReviewChecks.map((item) => item.id)).size).toBe(cvReviewChecks.length);
    expect(cvReviewChecks.every((item) => item.title.trim().length >= 10)).toBe(true);
    expect(cvReviewChecks.every((item) => item.detail.trim().length >= 30)).toBe(true);
    expect(cvReviewGroups.every((group) => cvReviewChecks.some((item) => item.group === group))).toBe(true);
    expect(cvReviewChecks.every((item) => cvReviewGroups.some((group) => group === item.group))).toBe(true);
  });

  it("counts only known unique items without inflating completion", () => {
    expect(cvReviewProgress([])).toBe(0);
    expect(cvReviewProgress(["contacto", "contacto", "nonexistent"])).toBe(1);
    expect(cvReviewProgress(cvReviewChecks.map((item) => item.id))).toBe(12);
    expect(cvReviewProgress([...cvReviewChecks.map((item) => item.id), "unknown"])).toBe(12);
  });

  it("communicates checks rather than claiming ATS guarantees", () => {
    const joined = cvReviewChecks.map((item) => item.detail).join(" ").toLowerCase();
    expect(joined).toContain("verifica");
    expect(joined).toContain("enlaces");
    expect(joined).toContain("datos");
  });
});
