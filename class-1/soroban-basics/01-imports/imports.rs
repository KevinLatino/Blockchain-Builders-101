// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS
// ¿Qué es? Las primeras líneas de todo contrato: le dicen a Rust qué usamos.
// ═══════════════════════════════════════════════════════════════════════════

// Sin librería estándar: el contrato corre en WebAssembly dentro de la
// blockchain, donde no hay sistema operativo (ni archivos, ni red, ni println!).
#![no_std]

// Todo sale del SDK de Soroban. Se importa SOLO lo que se usa:
use soroban_sdk::{
    contract, contractimpl, // macros  → convierten código Rust en un contrato
    Address, Env, String,   // tipos   → viven en la blockchain (no son los de std)
};

// En los tests (que corren en tu compu) se agregan las utilidades de prueba:
#[cfg(test)]
use soroban_sdk::testutils::Address as _; // `as _` = solo traemos sus métodos

// ✅ Importar explícitamente   ❌ use soroban_sdk::*;
