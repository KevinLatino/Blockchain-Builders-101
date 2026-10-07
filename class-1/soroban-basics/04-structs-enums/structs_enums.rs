// ═══════════════════════════════════════════════════════════════════════════
// STRUCTS Y ENUMS
// ¿Qué es? La forma de modelar datos propios. Con #[contracttype] se pueden
// guardar en storage y usar como argumentos/retornos del contrato.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contracttype, Address, String};

// ── #[derive(...)] ──────────────────────────────────────────────────────────
// Macro de Rust (no de Soroban) que le agrega "habilidades" automáticas a un tipo:
//
//   Clone      → se puede duplicar con .clone()
//   Copy       → se duplica solo al asignarlo (solo para tipos chicos: números, enums numéricos)
//   Debug      → se puede imprimir para depurar ({:?}); los tests lo necesitan para mostrar errores
//   PartialEq  → se puede comparar con ==   (lo usa assert_eq! en los tests)
//   Eq         → la comparación == es "total" (complemento de PartialEq)
//   PartialOrd → se puede comparar con <, >, <=, >=
//   Ord        → orden "total": permite ordenar y usar max/min
//
// Regla práctica: Clone, Debug, Eq y PartialEq casi siempre. Copy, PartialOrd y
// Ord solo si los necesitás (ej: enums numéricos y #[contracterror]).
// ────────────────────────────────────────────────────────────────────────────

// STRUCT → una "ficha" con varios campos
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Member {
    pub name: String,
    pub wallet: Address,
    pub level: Level,
    pub bio: Option<String>,
}

// ENUM simple → un menú de opciones cerradas
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Role {
    Admin,
    Member,
}

// ENUM con datos → cada opción lleva su propia información
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Plan {
    Free,
    Monthly(u64),     // vence en...
    Annual(u64, u32), // vence en..., invitaciones
}

// ENUM numérico → se guarda como número (barato y comparable: Bronze < Gold)
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Level {
    Bronze = 1,
    Silver = 2,
    Gold = 3,
}

// ⭐ PATRÓN DataKey → todas las claves del storage en un solo enum
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,           // clave única
    Member(Address), // una clave POR usuario
}
