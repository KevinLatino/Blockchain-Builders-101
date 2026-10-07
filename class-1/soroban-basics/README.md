# Clase 1 · Soroban Basics

Cada carpeta tiene **un archivo** que explica **qué es** un concepto y cómo se define.

| # | Archivo | Qué explica |
|---|---|---|
| 01 | [`01-imports/imports.rs`](01-imports/imports.rs) | `#![no_std]` y qué se importa del SDK |
| 02 | [`02-macros/macros.rs`](02-macros/macros.rs) | `#[contract]`, `#[contractimpl]`, `symbol_short!`, `vec!`, `map!`, `log!`… |
| 03 | [`03-env-and-types/env_and_types.rs`](03-env-and-types/env_and_types.rs) | Qué da `Env` y los tipos (`Address`, `i128`, `Symbol`…) |
| 04 | [`04-structs-enums/structs_enums.rs`](04-structs-enums/structs_enums.rs) | `#[contracttype]` y el patrón `DataKey` |
| 05 | [`05-storage/storage.rs`](05-storage/storage.rs) | `instance` / `persistent` / `temporary` + TTL |
| 06 | [`06-auth/auth.rs`](06-auth/auth.rs) | `require_auth()` |
| 07 | [`07-errors-panics/errors_panics.rs`](07-errors-panics/errors_panics.rs) | `#[contracterror]`, `Result`, `panic_with_error!` |
| 08 | [`08-events/events.rs`](08-events/events.rs) | `#[contractevent]`: topics + data |
| 09 | [`09-constructor/constructor.rs`](09-constructor/constructor.rs) | `__constructor` |
| 10 | [`10-modules/modules.rs`](10-modules/modules.rs) | Cómo dividir un contrato en módulos |
| 11 | [`11-cross-contract-calls/cross_contract_calls.rs`](11-cross-contract-calls/cross_contract_calls.rs) | Llamar a otro contrato |
| 12 | [`12-tests/tests.rs`](12-tests/tests.rs) | Anatomía de un test |

Para verificar que todos los ejemplos compilan y correr los tests:

```bash
cargo test
```
