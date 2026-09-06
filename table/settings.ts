export const NUMBER_COLUMN_NAME = "fairspec:number"
export const ERROR_COLUMN_NAME = "fairspec:error"

// Each check scans the whole source file, and polars materializes a CSV in full
// however the query is collected, so peak memory is the file size times the number
// of checks in flight. Validating a 1 GB file needed 5 GB at one check per core
// against 2.3 GB serially, for 3.7s against 7.3s.
export const INSPECT_COLUMN_CONCURRENCY = 1
export const INSPECT_ROW_CONCURRENCY = 1
