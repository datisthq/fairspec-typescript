import { describe, expect, it } from "vite-plus/test"
import { calculateTau0, calculateTau1 } from "../uniformity.ts"

describe("uniformity", () => {
  describe("calculateTau0", () => {
    it("should return 1 for uniform field counts", () => {
      const fieldCounts = [3, 3, 3, 3, 3]
      const tau0 = calculateTau0(fieldCounts)

      expect(tau0).toBe(1)
    })

    it("should return lower score for varying field counts", () => {
      const fieldCounts = [3, 4, 3, 5, 3]
      const tau0 = calculateTau0(fieldCounts)

      expect(tau0).toBeLessThan(1)
      expect(tau0).toBeGreaterThan(0)
    })

    it("should return 0 for empty array", () => {
      const tau0 = calculateTau0([])

      expect(tau0).toBe(0)
    })

    it("should penalize high variance", () => {
      const lowVariance = [3, 3, 3, 4, 3]
      const highVariance = [1, 5, 2, 8, 3]

      const tau0Low = calculateTau0(lowVariance)
      const tau0High = calculateTau0(highVariance)

      expect(tau0Low).toBeGreaterThan(tau0High)
    })
  })

  describe("calculateTau1", () => {
    it("should return high score for consistent field counts", () => {
      const fieldCounts = [3, 3, 3, 3, 3]
      const modalCount = 3
      const tau1 = calculateTau1(fieldCounts, modalCount)

      expect(tau1).toBeGreaterThan(0.9)
    })

    it("should return lower score for varying field counts", () => {
      const fieldCounts = [3, 4, 5, 3, 4]
      const modalCount = 3
      const tau1 = calculateTau1(fieldCounts, modalCount)

      expect(tau1).toBeLessThan(1)
      expect(tau1).toBeGreaterThan(0)
    })

    it("should return 0 for empty array", () => {
      const tau1 = calculateTau1([], 0)

      expect(tau1).toBe(0)
    })

    it("should penalize frequent transitions", () => {
      const fewTransitions = [3, 3, 3, 4, 4, 4]
      const manyTransitions = [3, 4, 3, 4, 3, 4]

      const tau1Few = calculateTau1(fewTransitions, 3)
      const tau1Many = calculateTau1(manyTransitions, 3)

      expect(tau1Few).toBeGreaterThan(tau1Many)
    })

    it("should favor higher mode dominance", () => {
      const highModeDominance = [3, 3, 3, 3, 4]
      const lowModeDominance = [3, 3, 4, 4, 5]

      const tau1High = calculateTau1(highModeDominance, 3)
      const tau1Low = calculateTau1(lowModeDominance, 3)

      expect(tau1High).toBeGreaterThan(tau1Low)
    })

    it("should penalize wide range", () => {
      const narrowRange = [3, 3, 4, 4, 3]
      const wideRange = [1, 3, 7, 3, 2]

      const tau1Narrow = calculateTau1(narrowRange, 3)
      const tau1Wide = calculateTau1(wideRange, 3)

      expect(tau1Narrow).toBeGreaterThan(tau1Wide)
    })
  })

  describe("combined tau0 and tau1", () => {
    it("should both score uniform data highly", () => {
      const fieldCounts = [5, 5, 5, 5, 5]
      const modalCount = 5

      const tau0 = calculateTau0(fieldCounts)
      const tau1 = calculateTau1(fieldCounts, modalCount)

      expect(tau0).toBeGreaterThan(0.9)
      expect(tau1).toBeGreaterThan(0.9)
    })

    it("should both score chaotic data lowly", () => {
      const fieldCounts = [1, 5, 2, 8, 3, 9, 1, 7]
      const modalCount = 1

      const tau0 = calculateTau0(fieldCounts)
      const tau1 = calculateTau1(fieldCounts, modalCount)

      expect(tau0).toBeLessThan(0.5)
      expect(tau1).toBeLessThan(0.5)
    })
  })
})
