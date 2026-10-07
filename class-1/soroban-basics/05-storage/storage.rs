// ═══════════════════════════════════════════════════════════════════════════
// STORAGE
// ¿Qué es? Donde el contrato guarda datos. Es como ALQUILAR una baulera:
// cada dato tiene un vencimiento (TTL, en ledgers) y hay que renovarlo.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Balance(Address),
    Cooldown(Address),
}

// Los 3 tipos de storage:
fn three_kinds(env: &Env, admin: Address, user: Address) {
    // INSTANCE → config global y chica (admin, token). Vive con el contrato.
    env.storage().instance().set(&DataKey::Admin, &admin);

    // PERSISTENT → datos de usuarios que NO se pueden perder (saldos).
    //              Si vence se archiva, pero se puede restaurar.
    env.storage().persistent().set(&DataKey::Balance(user.clone()), &100_i128);

    // TEMPORARY → datos de vida corta (cooldowns, cachés). Si vence, se BORRA.
    env.storage().temporary().set(&DataKey::Cooldown(user), &true);
}

// Las operaciones (iguales en los 3 tipos):
fn operations(env: &Env, user: Address) {
    let key = DataKey::Balance(user);
    let s = env.storage().persistent();

    s.set(&key, &100_i128);                          // escribir
    let value: Option<i128> = s.get(&key);           // leer (None si no existe)
    let exists: bool = s.has(&key);                  // ¿existe?
    s.remove(&key);                                  // borrar

    // Renovar el "alquiler": si le quedan < 100 ledgers, extender a 500.
    s.extend_ttl(&key, 100, 500);
}

// 1 ledger ≈ 5 segundos → 17_280 ledgers ≈ 1 día
pub const DAY_IN_LEDGERS: u32 = 17_280;
