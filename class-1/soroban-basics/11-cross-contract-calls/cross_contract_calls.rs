// ═══════════════════════════════════════════════════════════════════════════
// CROSS-CONTRACT CALLS
// ¿Qué es? Un contrato llamando a otro contrato, como piezas de LEGO.
// (Así funciona DeFi: un DEX usa tokens, un préstamo usa un oráculo…)
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contract, contractclient, contractimpl, token, Address, Env};

// 1) Describir la INTERFAZ del otro contrato → la macro genera `CounterClient`
#[contractclient(name = "CounterClient")]
pub trait Counter {
    fn increment(env: Env, by: u32) -> u32;
}

// (Alternativa: importar el .wasm compilado del otro contrato)
//   mod counter { soroban_sdk::contractimport!(file = "counter.wasm"); }
//   let client = counter::Client::new(&env, &address);

#[contract]
pub struct Caller;

#[contractimpl]
impl Caller {
    // 2) Llamarlo
    pub fn call(env: Env, counter: Address) -> u32 {
        let client = CounterClient::new(&env, &counter);
        client.increment(&1) // si el otro contrato falla → falla todo
    }

    // 3) Llamarlo manejando el error
    pub fn safe_call(env: Env, counter: Address) -> u32 {
        let client = CounterClient::new(&env, &counter);
        match client.try_increment(&1) {
            Ok(Ok(value)) => value,
            _ => 0, // decidimos qué hacer si falla
        }
    }

    // Tokens (XLM, USDC...): el SDK ya trae su cliente
    pub fn pay(env: Env, token: Address, from: Address, to: Address, amount: i128) {
        from.require_auth();
        token::TokenClient::new(&env, &token).transfer(&from, &to, &amount);
    }
}
