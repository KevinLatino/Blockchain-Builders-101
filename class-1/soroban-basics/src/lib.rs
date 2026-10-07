//! Reúne los ejemplos de cada carpeta para compilarlos juntos.
//! El material de la clase está en las carpetas, no acá.
#![no_std]
#![allow(dead_code, unused_imports, unused_variables, unused_attributes)]

#[path = "../01-imports/imports.rs"]
mod imports;
#[path = "../02-macros/macros.rs"]
mod macros;
#[path = "../03-env-and-types/env_and_types.rs"]
mod env_and_types;
#[path = "../04-structs-enums/structs_enums.rs"]
mod structs_enums;
#[path = "../05-storage/storage.rs"]
mod storage;
#[path = "../06-auth/auth.rs"]
mod auth;
#[path = "../07-errors-panics/errors_panics.rs"]
mod errors_panics;
#[path = "../08-events/events.rs"]
mod events;
#[path = "../09-constructor/constructor.rs"]
mod constructor;
#[path = "../10-modules/modules.rs"]
mod modules;
#[path = "../11-cross-contract-calls/cross_contract_calls.rs"]
mod cross_contract_calls;
#[path = "../12-tests/tests.rs"]
mod tests;
