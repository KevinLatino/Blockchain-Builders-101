// ═══════════════════════════════════════════════════════════════════════════
// ENV Y TIPOS
// ¿Qué es `Env`? La "ventana" del contrato a la blockchain. Todo pasa por él.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{Address, Bytes, BytesN, Env, Map, String, Symbol, Vec};

fn what_env_gives_you(env: &Env) {
    env.storage();                      // guardar / leer datos         (05-storage/)
    env.events();                       // emitir eventos               (08-events/)
    env.ledger().timestamp();           // hora actual (segundos Unix)
    env.ledger().sequence();            // número de ledger ("bloque")
    env.current_contract_address();     // la dirección de ESTE contrato
    env.crypto().sha256(&Bytes::new(env)); // hashes y firmas
}

// ¿Qué son los tipos del SDK? Los datos que el contrato entiende.
fn types(env: &Env, user: Address) {
    let id: u32 = 7;                                  // contadores, ids
    let deadline: u64 = 1_767_225_600;                // timestamps
    let amount: i128 = 10_000_000;                    // montos de tokens (1 XLM = 10_000_000)
    let active: bool = true;
    let who: Address = user;                          // cuenta (G...) o contrato (C...)
    let key: Symbol = Symbol::new(env, "balance");    // identificador corto
    let name: String = String::from_str(env, "Ana");  // texto libre
    let hash: BytesN<32> = BytesN::from_array(env, &[0; 32]); // bytes fijos (hashes)
    let list: Vec<u32> = Vec::new(env);               // lista
    let table: Map<Symbol, i128> = Map::new(env);     // diccionario (claves ordenadas)
    let maybe: Option<u32> = None;                    // puede no existir
}

// ⚠️ No hay floats (f32/f64): todo es matemática entera.
//    Porcentajes → basis points: amount * bps / 10_000   (250 bps = 2.5 %)
