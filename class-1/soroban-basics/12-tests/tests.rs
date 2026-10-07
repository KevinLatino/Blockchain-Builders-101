// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ¿Qué es? Una blockchain de juguete en memoria para probar el contrato
// antes de desplegarlo. Se corre con:  cargo test
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contract, contracterror, contractimpl, Address, Env};

// Contrato mínimo para tener algo que testear
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    InvalidAmount = 1,
}

#[contract]
pub struct Counter;

#[contractimpl]
impl Counter {
    pub fn add(env: Env, user: Address, n: u32) -> Result<u32, Error> {
        user.require_auth();
        if n == 0 {
            return Err(Error::InvalidAmount);
        }
        Ok(n)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger as _};

    #[test]
    fn anatomy_of_a_test() {
        let env = Env::default();                         // 1. blockchain de juguete
        let id = env.register(Counter, ());               // 2. desplegar (args del constructor)
        let client = CounterClient::new(&env, &id);       // 3. cliente generado por #[contractimpl]
        let alice = Address::generate(&env);              // 4. usuarios de prueba
        env.mock_all_auths();                             // 5. simular que todos firman

        assert_eq!(client.add(&alice, &5), 5);            // 6. llamar y verificar
    }

    #[test]
    fn testing_errors() {
        let env = Env::default();
        env.mock_all_auths();
        let client = CounterClient::new(&env, &env.register(Counter, ()));
        let alice = Address::generate(&env);

        // try_ → devuelve el error en vez de hacer panic
        assert_eq!(client.try_add(&alice, &0), Err(Ok(Error::InvalidAmount)));
    }

    #[test]
    fn useful_tools() {
        let env = Env::default();
        env.mock_all_auths();
        let client = CounterClient::new(&env, &env.register(Counter, ()));
        let alice = Address::generate(&env);

        env.ledger().set_timestamp(1_700_000_000);        // viajar en el tiempo
        client.add(&alice, &1);
        assert_eq!(env.auths()[0].0, alice);              // ¿quién firmó?
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]     // esperar que falle
    fn panics_with_error() {
        let env = Env::default();
        env.mock_all_auths();
        let client = CounterClient::new(&env, &env.register(Counter, ()));
        client.add(&Address::generate(&env), &0);
    }
}
