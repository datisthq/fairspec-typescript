# Changelog

## [0.12.4](https://github.com/fairspec/fairspec-typescript/compare/v0.12.3...v0.12.4) (2026-06-15)

### Bug Fixes

- **dataset:** make dataset copy persist to a new folder ([cf0beef](https://github.com/fairspec/fairspec-typescript/commit/cf0beefab8cc77057145a4bfc9e1a2ab750c7cba))

## [0.12.3](https://github.com/fairspec/fairspec-typescript/compare/v0.12.2...v0.12.3) (2026-06-15)

### Bug Fixes

- **metadata:** accept object integrity in dataset profile ([5230677](https://github.com/fairspec/fairspec-typescript/commit/5230677694f0ced07876961d002548f4065872a0)), closes [fairspec-standard#35](https://github.com/fairspec/fairspec-standard/issues/35)

## [0.12.2](https://github.com/fairspec/fairspec-typescript/compare/v0.12.1...v0.12.2) (2026-06-15)

### Bug Fixes

- reference xlsx via pnpm catalog to satisfy peer dep spec ([cd28fa1](https://github.com/fairspec/fairspec-typescript/commit/cd28fa18f4560bd93e5310eaf222fec5aefca043))
- **terminal:** set non-zero exit code on validation failure ([9fe1ded](https://github.com/fairspec/fairspec-typescript/commit/9fe1ded7e757c38e654d0fd344149ab8d0607c72))

## [0.12.1](https://github.com/fairspec/fairspec-typescript/compare/v0.12.0...v0.12.1) (2026-05-15)

### Bug Fixes

- move xlsx to peerDependencies ([7c5e740](https://github.com/fairspec/fairspec-typescript/commit/7c5e740f474d4d0b66769832d47ccaf6fceaaa9e))

## [0.12.0](https://github.com/fairspec/fairspec-typescript/compare/v0.11.3...v0.12.0) (2026-02-11)

### Features

- Export metadata submodels ([cf8f8a7](https://github.com/fairspec/fairspec-typescript/commit/cf8f8a73ac71e458c3ab4f80c45b0e14a424e4a6))

## [0.11.3](https://github.com/fairspec/fairspec-typescript/compare/v0.11.2...v0.11.3) (2026-02-10)

### Bug Fixes

- File dialect profile url ([679eda1](https://github.com/fairspec/fairspec-typescript/commit/679eda12fcea9883900dd76d688abbd640fb4362))

## [0.11.2](https://github.com/fairspec/fairspec-typescript/compare/v0.11.1...v0.11.2) (2026-02-10)

### Bug Fixes

- Fixed fairspec version setting ([51590ed](https://github.com/fairspec/fairspec-typescript/commit/51590ed32e41ba7941a54010722dd0ff0509e090))

## [0.11.1](https://github.com/fairspec/fairspec-typescript/compare/v0.11.0...v0.11.1) (2026-02-10)

### Bug Fixes

- Improve infer table schema ([#33](https://github.com/fairspec/fairspec-typescript/issues/33)) ([0cd04ec](https://github.com/fairspec/fairspec-typescript/commit/0cd04ecc06dc08b893ce303a30c5fcb59aa12cca))

## [0.11.0](https://github.com/fairspec/fairspec-typescript/compare/v0.10.0...v0.11.0) (2026-02-10)

### Features

- Support nullable properties and all required ([#32](https://github.com/fairspec/fairspec-typescript/issues/32)) ([1f737ab](https://github.com/fairspec/fairspec-typescript/commit/1f737ab5b49d8e39eb005126a38c75e1d96497b0))

## [0.10.0](https://github.com/fairspec/fairspec-typescript/compare/v0.9.3...v0.10.0) (2026-02-09)

### Features

- Rebase on File Dialect spec ([#31](https://github.com/fairspec/fairspec-typescript/issues/31)) ([97b2fd9](https://github.com/fairspec/fairspec-typescript/commit/97b2fd9134b25967076f12520371e5d821a4d421))

## [0.9.3](https://github.com/fairspec/fairspec-typescript/compare/v0.9.2...v0.9.3) (2026-02-09)

### Bug Fixes

- Fix row number tracking when data contains 'number' column ([#30](https://github.com/fairspec/fairspec-typescript/issues/30)) ([031a8eb](https://github.com/fairspec/fairspec-typescript/commit/031a8ebc57c524017bbbf94e610e7b9a5bce8eed)), closes [#29](https://github.com/fairspec/fairspec-typescript/issues/29) [#29](https://github.com/fairspec/fairspec-typescript/issues/29)

## [0.9.2](https://github.com/fairspec/fairspec-typescript/compare/v0.9.1...v0.9.2) (2026-02-06)

### Bug Fixes

- Fix MCP server ([#28](https://github.com/fairspec/fairspec-typescript/issues/28)) ([77f4ca1](https://github.com/fairspec/fairspec-typescript/commit/77f4ca128f2378ecc37cf78fc207fbd010788e55))

## [0.9.1](https://github.com/fairspec/fairspec-typescript/compare/v0.9.0...v0.9.1) (2026-02-06)

### Bug Fixes

- Fixed agent release ([5ee1b08](https://github.com/fairspec/fairspec-typescript/commit/5ee1b0840d0fc9588fcfb1b0b650d2ba6a1809cd))

## [0.8.0](https://github.com/fairspec/fairspec-typescript/compare/v0.7.0...v0.8.0) (2026-02-05)

### Features

- Improved dialect inference ([#26](https://github.com/fairspec/fairspec-typescript/issues/26)) ([829ce34](https://github.com/fairspec/fairspec-typescript/commit/829ce3494dd7b038ce99a533c25dbf20459e9a15))

### Bug Fixes

- Fixed dialect usage in loadTable ([94fe2b3](https://github.com/fairspec/fairspec-typescript/commit/94fe2b384bde8b41ea3f27fd7f7732c15ed6db9e))

## [0.7.0](https://github.com/fairspec/fairspec-typescript/compare/v0.6.1...v0.7.0) (2026-02-04)

### Features

- Improved dialect support ([#25](https://github.com/fairspec/fairspec-typescript/issues/25)) ([658b184](https://github.com/fairspec/fairspec-typescript/commit/658b1840cdb3799c4a000e0f75580553f315961c))

## [0.6.1](https://github.com/fairspec/fairspec-typescript/compare/v0.6.0...v0.6.1) (2026-02-04)

### Bug Fixes

- Limit preview to 100 rows ([337fdc6](https://github.com/fairspec/fairspec-typescript/commit/337fdc6f23883647f679da1c6ea264cd6c4e2f6a))

## [0.6.0](https://github.com/fairspec/fairspec-typescript/compare/v0.5.2...v0.6.0) (2026-02-04)

### Features

- Preview table command ([#24](https://github.com/fairspec/fairspec-typescript/issues/24)) ([6301bde](https://github.com/fairspec/fairspec-typescript/commit/6301bde92c826c459a9da721c26b57a69d7cb4ff))

## [0.5.2](https://github.com/fairspec/fairspec-typescript/compare/v0.5.1...v0.5.2) (2026-01-27)

### Bug Fixes

- Fixed assertion messages ([f6768fa](https://github.com/fairspec/fairspec-typescript/commit/f6768fa528f8a01367bc8cee0b844a57ffa2444e))

## [0.5.1](https://github.com/fairspec/fairspec-typescript/compare/v0.5.0...v0.5.1) (2026-01-27)

### Bug Fixes

- Fixed resource errors ([5b954e9](https://github.com/fairspec/fairspec-typescript/commit/5b954e919882da766222daa996ce8daae4c1bf00))

## [0.5.0](https://github.com/fairspec/fairspec-typescript/compare/v0.4.0...v0.5.0) (2026-01-27)

### Features

- Improve error hierarchy ([#23](https://github.com/fairspec/fairspec-typescript/issues/23)) ([af8266c](https://github.com/fairspec/fairspec-typescript/commit/af8266cdb4388b82a6c3990e23f267c7cd989ef6))

## [0.4.0](https://github.com/fairspec/fairspec-typescript/compare/v0.3.0...v0.4.0) (2026-01-22)

### Features

- Migrated to fairspec@0.3.0 ([#22](https://github.com/fairspec/fairspec-typescript/issues/22)) ([de6eaa6](https://github.com/fairspec/fairspec-typescript/commit/de6eaa628a7f52e4eb1d6da38b98a21f1a68b3d9))

## [0.3.0](https://github.com/fairspec/fairspec-typescript/compare/v0.2.2...v0.3.0) (2026-01-22)

### Features

- Migrate to fairspec@0.2.2 ([#21](https://github.com/fairspec/fairspec-typescript/issues/21)) ([b2f1914](https://github.com/fairspec/fairspec-typescript/commit/b2f191421893c32977488cede8cd06a4dade84a8))

## [0.2.2](https://github.com/fairspec/fairspec-typescript/compare/v0.2.1...v0.2.2) (2026-01-19)

### Bug Fixes

- Fixed tableSchema rendering ([fc163f7](https://github.com/fairspec/fairspec-typescript/commit/fc163f7beeab6966e4e52b6c1a8e8019d0c2ca05))

## [0.2.1](https://github.com/fairspec/fairspec-typescript/compare/v0.2.0...v0.2.1) (2026-01-19)

### Bug Fixes

- Updated table profile ([5382bec](https://github.com/fairspec/fairspec-typescript/commit/5382beca5f116ebdd3badcd0bfe2ac67c2d495f8))
