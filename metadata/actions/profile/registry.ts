import type { Profile, ProfileRegistry, ProfileType } from "../../models/profile.ts"
import catalogProfile from "../../profiles/catalog.json" with { type: "json" }
import dataSchemaProfile from "../../profiles/data-schema.json" with { type: "json" }
import datasetProfile from "../../profiles/dataset.json" with { type: "json" }
import fileDialectProfile from "../../profiles/file-dialect.json" with { type: "json" }
import tableSchemaProfile from "../../profiles/table-schema.json" with { type: "json" }
import { FAIRSPEC_VERSION } from "../../settings.ts"

const bundledProfiles: { type: ProfileType; profile: Profile }[] = [
  { type: "catalog", profile: catalogProfile },
  { type: "dataset", profile: datasetProfile },
  { type: "file-dialect", profile: fileDialectProfile },
  { type: "data-schema", profile: dataSchemaProfile },
  { type: "table-schema", profile: tableSchemaProfile },
]

// The bundle is a snapshot of FAIRSPEC_VERSION, so it must answer to that version's URL as well
// as "latest" -- every save* action stamps the versioned one, and an exact-match miss goes remote.
export const profileRegistry: ProfileRegistry = bundledProfiles.flatMap(
  ({ type, profile }) =>
    ["latest", FAIRSPEC_VERSION].map(version => ({
      type,
      version,
      path: `https://fairspec.org/profiles/${version}/${type}.json`,
      profile,
    })),
)
