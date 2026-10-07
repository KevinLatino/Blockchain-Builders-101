// ═══════════════════════════════════════════════════════════════════════════
// STRUCTS Y ENUMS
// ¿Qué es? La forma de modelar datos propios. Con #[contracttype] se pueden
// guardar en storage y usar como argumentos/retornos del contrato.
// ═══════════════════════════════════════════════════════════════════════════
use soroban_sdk::{contracttype, Address, String};

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
