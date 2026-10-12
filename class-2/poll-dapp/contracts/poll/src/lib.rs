//! Encuesta on-chain: una pregunta, varias opciones, un voto por cuenta.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, Address,
    Env, String, Vec,
};

// Los datos viven ~30 días; cada vez que se escriben se renueva el "alquiler".
const DAY_IN_LEDGERS: u32 = 17_280;
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const LIFETIME_THRESHOLD: u32 = BUMP_AMOUNT - DAY_IN_LEDGERS;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Question,       // instance
    Options,        // instance
    Votes(u32),     // persistent: votos de la opción N
    Voted(Address), // persistent: esta cuenta ya votó
}

/// Códigos FIJOS: el frontend los traduce a mensajes (Error(Contract, #2) = ya votaste).
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PollError {
    InvalidOption = 1,
    AlreadyVoted = 2,
    NoOptions = 3,
}

/// Se emite en cada voto: un indexador puede reconstruir el historial con esto.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Voted {
    #[topic]
    pub voter: Address,
    pub option: u32,
}

#[contract]
pub struct Poll;

#[contractimpl]
impl Poll {
    /// Se ejecuta una sola vez, al desplegar.
    /// (Se llama `choices` y no `options`: los bindings de TypeScript ya usan
    /// `options` como nombre de parámetro y el código generado no compilaría.)
    pub fn __constructor(env: Env, question: String, choices: Vec<String>) {
        if choices.is_empty() {
            panic_with_error!(&env, PollError::NoOptions);
        }
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Options, &choices);
        extend_instance(&env);
    }

    pub fn vote(env: Env, voter: Address, option: u32) -> Result<(), PollError> {
        voter.require_auth(); // nadie puede votar por otro

        if option >= Self::get_options(env.clone()).len() {
            return Err(PollError::InvalidOption);
        }
        let voted = DataKey::Voted(voter.clone());
        if env.storage().persistent().has(&voted) {
            return Err(PollError::AlreadyVoted);
        }

        let votes = DataKey::Votes(option);
        let count: u32 = env.storage().persistent().get(&votes).unwrap_or(0);
        set_persistent(&env, &voted, &true);
        set_persistent(&env, &votes, &(count + 1));
        extend_instance(&env);

        Voted { voter, option }.publish(&env);
        Ok(())
    }

    /// Votos de cada opción, en el mismo orden que `get_options()`.
    pub fn get_results(env: Env) -> Vec<u32> {
        let mut results = Vec::new(&env);
        for i in 0..Self::get_options(env.clone()).len() {
            results.push_back(
                env.storage()
                    .persistent()
                    .get(&DataKey::Votes(i))
                    .unwrap_or(0),
            );
        }
        results
    }

    pub fn get_question(env: Env) -> String {
        env.storage().instance().get(&DataKey::Question).unwrap()
    }

    pub fn get_options(env: Env) -> Vec<String> {
        env.storage().instance().get(&DataKey::Options).unwrap()
    }

    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().persistent().has(&DataKey::Voted(voter))
    }
}

fn set_persistent<V: soroban_sdk::IntoVal<Env, soroban_sdk::Val>>(
    env: &Env,
    key: &DataKey,
    value: &V,
) {
    env.storage().persistent().set(key, value);
    env.storage()
        .persistent()
        .extend_ttl(key, LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT);
}

mod test;
