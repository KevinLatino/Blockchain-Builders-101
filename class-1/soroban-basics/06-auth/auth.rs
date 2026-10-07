// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ¿Qué es? Verificar que quien dice ser alguien realmente FIRMÓ la operación.
// El contrato recibe una Address y le pide su firma con `require_auth()`.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contract, contractimpl, Address, Env, IntoVal};

#[contract]
pub struct Vault;

#[contractimpl]
impl Vault {
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        // ¿`from` firmó transfer(from, to, amount)? Si no → falla TODO.
        from.require_auth();
        // ... mover fondos
    }

    pub fn burn(env: Env, owner: Address, amount: i128) {
        // Variante: la firma cubre solo algunos argumentos.
        owner.require_auth_for_args((amount,).into_val(&env));
    }
}

// ✅ Pedir la firma de quien PIERDE algo (`from`, nunca `to`).
// ✅ El admin se lee del storage y se le pide la firma:
//      let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
//      admin.require_auth();
// ❌ if caller == admin { ... }   ← sin require_auth, cualquiera puede pasar esa dirección.
