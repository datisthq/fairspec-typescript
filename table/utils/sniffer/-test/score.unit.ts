import { describe, expect, it } from "vite-plus/test"
import type { PotentialDialect } from "../potentialDialects.ts"
import { findBestDialect, scoreDialect } from "../score.ts"

describe("score", () => {
  describe("scoreDialect", () => {
    it("should score comma-delimited CSV highly", () => {
      const csv = "a,b,c\n1,2,3\n4,5,6"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.gamma).toBeGreaterThan(0.5)
      expect(score.isUniform).toBe(true)
      expect(score.numFields).toBe(3)
    })

    it("should score incorrect delimiter poorly", () => {
      const csv = "a,b,c\n1,2,3\n4,5,6"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 9, // tab instead of comma
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.gamma).toBeLessThan(0.5)
      expect(score.numFields).toBe(1)
    })

    it("should detect non-uniform tables", () => {
      const csv = "a,b\n1,2\n3,4,5"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.isUniform).toBe(false)
    })

    it("should calculate tau0 and tau1", () => {
      const csv = "a,b,c\n1,2,3\n4,5,6"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.tau0).toBeGreaterThan(0)
      expect(score.tau1).toBeGreaterThan(0)
    })

    it("should handle quoted fields", () => {
      const csv = '"a","b,c","d"\n"1","2,3","4"'
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "Some", char: 34 },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.numFields).toBe(3)
      expect(score.isUniform).toBe(true)
    })
  })

  describe("findBestDialect", () => {
    it("should select highest scoring dialect", () => {
      const csv = "a,b,c\n1,2,3\n4,5,6"
      const bytes = new TextEncoder().encode(csv)

      const dialects: PotentialDialect[] = [
        { delimiter: 44, quote: { type: "None" }, lineTerminator: "LF" },
        { delimiter: 9, quote: { type: "None" }, lineTerminator: "LF" },
        { delimiter: 59, quote: { type: "None" }, lineTerminator: "LF" },
      ]

      const scores = dialects.map(dialect => scoreDialect(bytes, dialect))
      const best = findBestDialect(scores, {
        preferCommonDelimiters: true,
        preferDoubleQuote: true,
      })

      expect(best.dialect.delimiter).toBe(44)
    })

    it("should prefer common delimiters when preference is set", () => {
      const csv = "a,b\n1,2\n3,4"
      const bytes = new TextEncoder().encode(csv)

      const dialects: PotentialDialect[] = [
        { delimiter: 44, quote: { type: "None" }, lineTerminator: "LF" },
        { delimiter: 94, quote: { type: "None" }, lineTerminator: "LF" },
      ]

      const scores = dialects.map(dialect => scoreDialect(bytes, dialect))

      const firstScore = scores[0]
      const secondScore = scores[1]
      if (firstScore && secondScore) {
        firstScore.gamma = 0.7
        secondScore.gamma = 0.71
      }

      const best = findBestDialect(scores, {
        preferCommonDelimiters: true,
        preferDoubleQuote: false,
      })

      expect(best.dialect.delimiter).toBe(44)
    })

    it("should prefer double quote when preference is set", () => {
      const csv = '"a","b"\n"1","2"'
      const bytes = new TextEncoder().encode(csv)

      const dialects: PotentialDialect[] = [
        {
          delimiter: 44,
          quote: { type: "Some", char: 34 },
          lineTerminator: "LF",
        },
        {
          delimiter: 44,
          quote: { type: "Some", char: 39 },
          lineTerminator: "LF",
        },
      ]

      const scores = dialects.map(dialect => scoreDialect(bytes, dialect))

      const best = findBestDialect(scores, {
        preferCommonDelimiters: false,
        preferDoubleQuote: true,
      })

      if (best.dialect.quote.type === "Some") {
        expect(best.dialect.quote.char).toBe(34)
      }
    })

    it("should throw error for empty scores array", () => {
      expect(() =>
        findBestDialect([], {
          preferCommonDelimiters: true,
          preferDoubleQuote: true,
        }),
      ).toThrow()
    })

    it("should handle single score", () => {
      const csv = "a,b\n1,2"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)
      const best = findBestDialect([score], {
        preferCommonDelimiters: true,
        preferDoubleQuote: true,
      })

      expect(best).toBe(score)
    })
  })

  describe("gamma calculation", () => {
    it("should reward uniform tables", () => {
      const uniformCsv = "a,b,c\n1,2,3\n4,5,6\n7,8,9"
      const nonUniformCsv = "a,b\n1,2,3\n4,5\n6,7,8,9"

      const uniformBytes = new TextEncoder().encode(uniformCsv)
      const nonUniformBytes = new TextEncoder().encode(nonUniformCsv)

      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const uniformScore = scoreDialect(uniformBytes, dialect)
      const nonUniformScore = scoreDialect(nonUniformBytes, dialect)

      expect(uniformScore.gamma).toBeGreaterThan(nonUniformScore.gamma)
    })

    it("should reward reasonable field counts", () => {
      const csv2Fields = "a,b\n1,2\n3,4"
      const csv100Fields =
        "a," +
        "b,".repeat(98) +
        "z\n" +
        "1," +
        "2,".repeat(98) +
        "3\n" +
        "4," +
        "5,".repeat(98) +
        "6"

      const bytes2 = new TextEncoder().encode(csv2Fields)
      const bytes100 = new TextEncoder().encode(csv100Fields)

      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score2 = scoreDialect(bytes2, dialect)
      const score100 = scoreDialect(bytes100, dialect)

      expect(score2.numFields).toBe(2)
      expect(score100.numFields).toBeGreaterThan(50)
    })

    it("should cap gamma at 2", () => {
      const csv = "a,b,c\n1,2,3\n4,5,6\n7,8,9\n10,11,12"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.gamma).toBeLessThanOrEqual(2)
    })

    it("should ensure gamma is non-negative", () => {
      const csv = "random text without structure"
      const bytes = new TextEncoder().encode(csv)
      const dialect: PotentialDialect = {
        delimiter: 44,
        quote: { type: "None" },
        lineTerminator: "LF",
      }

      const score = scoreDialect(bytes, dialect)

      expect(score.gamma).toBeGreaterThanOrEqual(0)
    })
  })
})
