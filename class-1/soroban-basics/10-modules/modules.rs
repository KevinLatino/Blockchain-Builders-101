// ═══════════════════════════════════════════════════════════════════════════
// MÓDULOS
// ¿Qué es? Dividir el contrato en partes, cada una con UNA responsabilidad.
//
// En un proyecto real cada `mod` es un archivo:
//
//   src/
//   ├── lib.rs        ← declara los módulos:  mod errors; mod storage; ...
//   ├── contract.rs   ← #[contract] + #[contractimpl]
//   ├── types.rs      ← #[contracttype]
//   ├── errors.rs     ← #[contracterror]
//   ├── events.rs     ← #[contractevent]
//   ├── storage.rs    ← DataKey + leer/escribir
//   └── test.rs
//
// Acá los escribimos en un solo archivo para verlos juntos:
// ═══════════════════════════════════════════════════════════════════════════

mod errors {
    use soroban_sdk::contracterror;

    #[contracterror]
    #[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
    #[repr(u32)]
    pub enum Error {
        NotFound = 1,
    }
}

mod storage {
    use crate::modules::errors::Error; // en un proyecto real: use crate::errors::Error;
    use soroban_sdk::{contracttype, Address, Env};

    #[contracttype]
    #[derive(Clone)]
    enum DataKey {        // privado: solo este módulo toca el storage
        Balance(Address),
    }

    pub fn read_balance(env: &Env, user: &Address) -> Result<i128, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(user.clone()))
            .ok_or(Error::NotFound)
    }
}

mod contract {
    use super::{errors::Error, storage};
    use soroban_sdk::{contract, contractimpl, Address, Env};

    #[contract]
    pub struct Bank;

    #[contractimpl]
    impl Bank {
        pub fn balance(env: Env, user: Address) -> Result<i128, Error> {
            storage::read_balance(&env, &user)
        }
    }
}

// `pub use` decide qué se expone hacia afuera
pub use contract::{Bank, BankClient};
pub use errors::Error;
