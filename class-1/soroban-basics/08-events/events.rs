// ═══════════════════════════════════════════════════════════════════════════
// EVENTOS
// ¿Qué es? Las "notificaciones" del contrato: avisan al mundo exterior
// (wallets, exploradores, frontends) que algo pasó. Otros contratos NO los leen.
//
//   Un evento =  TOPICS (para filtrar/buscar)  +  DATA (el contenido)
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contractevent, Address, Env};

// Definición
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Transfer {
    #[topic]
    pub from: Address, // topic → se puede filtrar por él
    #[topic]
    pub to: Address,   // topic
    pub amount: i128,  // data
}
// Resultado:
//   topics = ["transfer", from, to]      ← el nombre del struct va primero
//   data   = { amount: 100 }

// Variante: data como valor único (formato del estándar de tokens)
#[contractevent(data_format = "single-value")]
pub struct Mint {
    #[topic]
    pub to: Address,
    pub amount: i128,
}
//   topics = ["mint", to]     data = 100

// Variante: topics propios en lugar del nombre del struct
#[contractevent(topics = ["config", "fee"])]
pub struct FeeUpdated {
    pub new_fee: u32,
}
//   topics = ["config", "fee"]     data = { new_fee: 25 }

// Emitir (dentro de una función del contrato)
fn emit(env: &Env, from: Address, to: Address) {
    Transfer { from, to, amount: 100 }.publish(env);
}
