// ═══════════════════════════════════════════════════════════════════════════
// MACROS
// ¿Qué es? Etiquetas que le ponemos al código para que el SDK genere por
// nosotros todo lo necesario para que la blockchain lo entienda.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contract, contractimpl, contractmeta, log, map, symbol_short, vec, Env, Map, Symbol, Vec};

// ── Macros de atributo #[...] ───────────────────────────────────────────────

#[contract]         // "Este struct ES el contrato"
pub struct MyContract;

#[contractimpl]     // "Cada pub fn de acá adentro se puede llamar desde la blockchain"
impl MyContract {
    pub fn hello(env: Env) -> Symbol {
        symbol_short!("hello")
    }
}

// Otras macros de atributo (cada una tiene su carpeta):
//   #[contracttype]   → structs/enums que se guardan o se pasan   (04-structs-enums/)
//   #[contracterror]  → errores con código numérico               (07-errors-panics/)
//   #[contractevent]  → eventos                                   (08-events/)
//   #[contractclient] → cliente para llamar a otro contrato       (11-cross-contract-calls/)

// ── Macros de función nombre!(...) ──────────────────────────────────────────

contractmeta!(key = "Description", val = "Ejemplo BB101"); // metadata dentro del .wasm

fn function_macros(env: &Env) {
    let s: Symbol = symbol_short!("stellar");          // Symbol corto (≤ 9 caracteres)
    let v: Vec<u32> = vec![env, 1, 2, 3];               // Vec del SDK
    let m: Map<Symbol, u32> = map![env, (s, 1)];        // Map del SDK
    log!(env, "debug", v);                              // log (solo en 12-tests/debug)
    // panic_with_error!(env, Error::X)                 → ver 07-errors-panics/
}
