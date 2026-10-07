// ═══════════════════════════════════════════════════════════════════════════
// ERRORES Y PANICS
// ¿Qué es? La forma de cortar una operación explicando POR QUÉ falló.
// Si una función falla, TODOS sus cambios se revierten (es atómica).
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contracterror, panic_with_error, Env};

// Definición: un enum con códigos numéricos FIJOS (los clientes dependen de ellos).
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidAmount = 1,
    InsufficientBalance = 2,
    Overflow = 3,
}

// Forma 1 (recomendada): devolver Result<T, Error>
fn withdraw(balance: i128, amount: i128) -> Result<i128, Error> {
    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }
    if balance < amount {
        return Err(Error::InsufficientBalance);
    }
    Ok(balance - amount)
}

// Forma 2: panic_with_error! → cuando la función no devuelve Result
fn check_amount(env: &Env, amount: i128) {
    if amount <= 0 {
        panic_with_error!(env, Error::InvalidAmount);
    }
}

// Overflow: sumar de forma segura
fn add(a: i128, b: i128) -> Result<i128, Error> {
    a.checked_add(b).ok_or(Error::Overflow)
}

// El usuario ve:  Error(Contract, #2)  → el frontend sabe que es "saldo insuficiente".
// ❌ panic!("...") / .unwrap() → error genérico, sin información útil.
