import { describe, expect, it } from "vite-plus/test"
import { inferHash } from "../infer.ts"
import { writeTempFile } from "../temp.ts"
import { validateFile } from "../validate.ts"

describe("validateFile", () => {
  it("should validate textual successfully when file is UTF-8", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should validate textual successfully when file is ASCII", async () => {
    const buffer = Buffer.from("Simple ASCII text only", "ascii")
    const tempFilePath = await writeTempFile(buffer)

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should return error when textual is expected but file is binary", async () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00])
    const tempFilePath = await writeTempFile(buffer)

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors[0]).toEqual({
      type: "file/textual",
    })
  })

  it("should return error when textual is expected but file is latin1", async () => {
    const buffer = Buffer.from([
      0x43, 0x61, 0x66, 0xe9, 0x20, 0x72, 0xe9, 0x73, 0x75, 0x6d, 0xe9, 0x20, 0x6e, 0x61,
      0xef, 0x76, 0x65, 0x20, 0xe0, 0x20, 0x50, 0x61, 0x72, 0x69, 0x73, 0x2e, 0x20, 0xc7,
      0x61, 0x20, 0x63, 0x27, 0x65, 0x73, 0x74, 0x20, 0x62, 0x6f, 0x6e, 0x21,
    ])
    const tempFilePath = await writeTempFile(buffer)

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors[0]).toEqual({
      type: "file/textual",
    })
  })

  it("should validate integrity successfully when it matches", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "md5" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "md5",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should return error when integrity hash does not match", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "md5" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "md5",
        hash: "wronghash",
      },
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors[0]).toEqual({
      type: "file/integrity",
      hashType: "md5",
      expectedHash: "wronghash",
      actualHash,
    })
  })

  it("should validate sha256 integrity", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "sha256" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "sha256",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should validate sha1 integrity", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "sha1" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "sha1",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should validate sha512 integrity", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "sha512" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "sha512",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should validate both textual and integrity when both match", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "md5" })

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
      integrity: {
        type: "md5",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should return multiple errors when both textual and integrity do not match", async () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00])
    const tempFilePath = await writeTempFile(buffer)

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "md5" })

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
      integrity: {
        type: "md5",
        hash: "wronghash",
      },
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(2)
    expect(report.errors[0]?.type).toBe("file/textual")
    expect.assert(report.errors[1]?.type === "file/integrity")
    expect(report.errors[1]?.hashType).toBe("md5")
    expect(report.errors[1]?.expectedHash).toBe("wronghash")
    expect(report.errors[1]?.actualHash).toBe(actualHash)
  })

  it("should return error when only textual mismatch", async () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00])
    const tempFilePath = await writeTempFile(buffer)

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "md5" })

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
      integrity: {
        type: "md5",
        hash: actualHash,
      },
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors[0]?.type).toBe("file/textual")
  })

  it("should return error when only integrity mismatch", async () => {
    const tempFilePath = await writeTempFile("Hello, World!")

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
      integrity: {
        type: "md5",
        hash: "wronghash",
      },
    })

    expect(report.valid).toBe(false)
    expect(report.errors).toHaveLength(1)
    expect(report.errors[0]?.type).toBe("file/integrity")
  })

  it("should handle local file paths", async () => {
    const tempFilePath = await writeTempFile("x".repeat(2048))

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "sha256" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "sha256",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should handle empty file validation", async () => {
    const tempFilePath = await writeTempFile("")

    const actualHash = await inferHash({ data: tempFilePath }, { hashType: "sha256" })

    const report = await validateFile({
      data: tempFilePath,
      integrity: {
        type: "sha256",
        hash: actualHash,
      },
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })

  it("should validate textual for UTF-8 with special characters", async () => {
    const tempFilePath = await writeTempFile("Special: é, ñ, ü, ö, à")

    const report = await validateFile({
      data: tempFilePath,
      textual: true,
    })

    expect(report).toEqual({ valid: true, errors: [] })
  })
})
