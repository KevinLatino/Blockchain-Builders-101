#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, Events as _},
    vec, Env, Event, IntoVal, String, Symbol,
};

fn setup() -> (Env, Address, PollClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let options = vec![
        &env,
        String::from_str(&env, "Python"),
        String::from_str(&env, "JavaScript"),
        String::from_str(&env, "Java"),
        String::from_str(&env, "C / C++"),
    ];
    let question = String::from_str(&env, "¿Qué lenguaje aprendieron primero?");
    let id = env.register(Poll, (question, options));
    let client = PollClient::new(&env, &id);
    (env, id, client)
}

#[test]
fn constructor_stores_question_and_options() {
    let (env, _, client) = setup();
    assert_eq!(
        client.get_question(),
        String::from_str(&env, "¿Qué lenguaje aprendieron primero?")
    );
    assert_eq!(client.get_options().len(), 4);
    assert_eq!(client.get_results(), vec![&env, 0, 0, 0, 0]);
}

#[test]
fn vote_adds_one() {
    let (env, _, client) = setup();
    let alice = Address::generate(&env);

    client.vote(&alice, &1);

    assert_eq!(client.get_results(), vec![&env, 0, 1, 0, 0]);
    assert!(client.has_voted(&alice));
}

#[test]
fn vote_requires_the_voter_signature() {
    let (env, id, client) = setup();
    let alice = Address::generate(&env);

    client.vote(&alice, &0);

    let (signer, invocation) = env.auths().pop().unwrap();
    assert_eq!(signer, alice.clone());
    assert_eq!(
        invocation.function,
        AuthorizedFunction::Contract((
            id,
            Symbol::new(&env, "vote"),
            (alice, 0_u32).into_val(&env)
        ))
    );
}

#[test]
fn cannot_vote_twice() {
    let (env, _, client) = setup();
    let alice = Address::generate(&env);
    client.vote(&alice, &0);

    assert_eq!(
        client.try_vote(&alice, &2),
        Err(Ok(PollError::AlreadyVoted))
    );
    assert_eq!(client.get_results(), vec![&env, 1, 0, 0, 0]);
}

#[test]
fn invalid_option_is_rejected() {
    let (env, _, client) = setup();
    let alice = Address::generate(&env);

    assert_eq!(
        client.try_vote(&alice, &4),
        Err(Ok(PollError::InvalidOption))
    );
    assert!(!client.has_voted(&alice));
}

#[test]
fn results_keep_the_options_order() {
    let (env, _, client) = setup();
    for option in [3_u32, 0, 3, 2, 3, 0] {
        client.vote(&Address::generate(&env), &option);
    }
    // Python, JavaScript, Java, C / C++
    assert_eq!(client.get_results(), vec![&env, 2, 0, 1, 3]);
}

#[test]
fn vote_emits_event() {
    let (env, id, client) = setup();
    let alice = Address::generate(&env);

    client.vote(&alice, &2);

    let expected = Voted {
        voter: alice,
        option: 2,
    };
    assert_eq!(env.events().all(), [expected.to_xdr(&env, &id)]);
}

#[test]
fn errors_have_fixed_codes() {
    // Las slides y el frontend dependen de estos números.
    assert_eq!(PollError::InvalidOption as u32, 1);
    assert_eq!(PollError::AlreadyVoted as u32, 2);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn constructor_needs_options() {
    let env = Env::default();
    let question = String::from_str(&env, "?");
    env.register(Poll, (question, Vec::<String>::new(&env)));
}
