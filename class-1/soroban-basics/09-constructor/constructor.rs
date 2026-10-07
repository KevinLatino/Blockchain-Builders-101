// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR
// ¿Qué es? Una función especial que corre UNA sola vez, automáticamente,
// en el mismo momento en que se despliega el contrato.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
}

#[contract]
pub struct MyContract;

#[contractimpl]
impl MyContract {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }
}

// Se pasan los argumentos al desplegar:
//   CLI:   stellar contract deploy --wasm contrato.wasm --source alice --network testnet -- --admin alice
//   Test:  env.register(MyContract, (&admin,));
//
// ✅ Nunca más se puede volver a llamar.
// ❌ Patrón viejo: una función pública `initialize(admin)` después del deploy
//    → alguien podría llamarla antes que vos y quedarse como admin.
