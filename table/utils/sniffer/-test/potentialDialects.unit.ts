import { describe, expect, it } from "vite-plus/test"
import {
  DELIMITERS,
  detectLineTerminator,
  generatePotentialDialects,
  QUOTE_CHARS,
} from "../potentialDialects.ts"

describe("potentialDialects", () => {
  describe("detectLineTerminator", () => {
    it("should detect LF line terminator", () => {
      const text = "line1\nline2\nline3"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("LF")
    })

    it("should detect CRLF line terminator", () => {
      const text = "line1\r\nline2\r\nline3"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("CRLF")
    })

    it("should detect CR line terminator", () => {
      const text = "line1\rline2\rline3"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("CR")
    })

    it("should prefer CRLF over LF when both present", () => {
      const text = "line1\r\nline2\nline3"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("CRLF")
    })

    it("should prefer LF over CR when both present", () => {
      const text = "line1\nline2\rline3"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("LF")
    })

    it("should default to LF for empty input", () => {
      const bytes = new Uint8Array([])

      expect(detectLineTerminator(bytes)).toBe("LF")
    })

    it("should default to LF for single line", () => {
      const text = "single line without terminator"
      const bytes = new TextEncoder().encode(text)

      expect(detectLineTerminator(bytes)).toBe("LF")
    })
  })

  describe("generatePotentialDialects", () => {
    it("should generate dialects for all delimiter and quote combinations", () => {
      const dialects = generatePotentialDialects("LF")

      expect(dialects.length).toBe(DELIMITERS.length * QUOTE_CHARS.length)
    })

    it("should use provided line terminator", () => {
      const dialects = generatePotentialDialects("CRLF")

      expect(dialects.every(d => d.lineTerminator === "CRLF")).toBe(true)
    })

    it("should include all delimiters", () => {
      const dialects = generatePotentialDialects("LF")
      const delimiters = new Set(dialects.map(d => d.delimiter))

      for (const delimiter of DELIMITERS) {
        expect(delimiters.has(delimiter)).toBe(true)
      }
    })

    it("should include all quote characters", () => {
      const dialects = generatePotentialDialects("LF")
      const quotes = dialects.map(d => d.quote)

      const hasNone = quotes.some(q => q.type === "None")
      const hasDoubleQuote = quotes.some(q => q.type === "Some" && q.char === 34)
      const hasSingleQuote = quotes.some(q => q.type === "Some" && q.char === 39)

      expect(hasNone).toBe(true)
      expect(hasDoubleQuote).toBe(true)
      expect(hasSingleQuote).toBe(true)
    })

    it("should generate exactly 30 dialects (10 delimiters × 3 quotes)", () => {
      const dialects = generatePotentialDialects("LF")

      expect(dialects.length).toBe(30)
    })
  })

  describe("DELIMITERS constant", () => {
    it("should include common delimiters", () => {
      expect(DELIMITERS).toContain(44) // comma
      expect(DELIMITERS).toContain(9) // tab
      expect(DELIMITERS).toContain(59) // semicolon
      expect(DELIMITERS).toContain(124) // pipe
    })

    it("should have 10 delimiters", () => {
      expect(DELIMITERS.length).toBe(10)
    })
  })

  describe("QUOTE_CHARS constant", () => {
    it("should include None option", () => {
      const hasNone = QUOTE_CHARS.some(q => q.type === "None")
      expect(hasNone).toBe(true)
    })

    it("should include double quote", () => {
      const hasDoubleQuote = QUOTE_CHARS.some(q => q.type === "Some" && q.char === 34)
      expect(hasDoubleQuote).toBe(true)
    })

    it("should include single quote", () => {
      const hasSingleQuote = QUOTE_CHARS.some(q => q.type === "Some" && q.char === 39)
      expect(hasSingleQuote).toBe(true)
    })

    it("should have 3 quote options", () => {
      expect(QUOTE_CHARS.length).toBe(3)
    })
  })
})
