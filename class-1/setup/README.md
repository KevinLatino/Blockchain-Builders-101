# Preparar el entorno

Para escribir smart contracts en Stellar (Soroban) necesitás 3 cosas:

1. **Rust**: el lenguaje en el que se escriben los contratos.
2. El target **`wasm32v1-none`**: permite compilar los contratos a WebAssembly.
3. **Stellar CLI** (`stellar`): la herramienta de terminal para crear, compilar, desplegar e invocar contratos.

> Requisito: **Rust 1.84.0 o superior**.

## 🎥 Video tutorial

- macOS: _link pendiente_
- Windows: _link pendiente_

---

## Paso 1 · Instalar Rust

Elegí tu sistema operativo:

<details>
<summary><strong>🍎 macOS</strong></summary>

1. Instalá las herramientas de línea de comandos de Apple (si no las tenés):

   ```bash
   xcode-select --install
   ```

2. Instalá Rust:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

   Cuando pregunte, elegí la opción **1) Proceed with standard installation** (Enter).

3. Cargá Rust en la terminal actual (o cerrala y abrí una nueva):

   ```bash
   source "$HOME/.cargo/env"
   ```

</details>

<details>
<summary><strong>🐧 Linux (Ubuntu / Debian)</strong></summary>

1. Instalá las herramientas de compilación:

   ```bash
   sudo apt update && sudo apt install -y build-essential curl
   ```

   > Fedora: `sudo dnf groupinstall "Development Tools"` · Arch: `sudo pacman -S base-devel`

2. Instalá Rust:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

   Cuando pregunte, elegí la opción **1) Proceed with standard installation** (Enter).

3. Cargá Rust en la terminal actual (o cerrala y abrí una nueva):

   ```bash
   source "$HOME/.cargo/env"
   ```

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

**Opción A: Windows nativo**

1. Descargá y ejecutá **`rustup-init.exe`** desde <https://www.rust-lang.org/tools/install>.
2. Si te pide instalar **Visual Studio C++ Build Tools**, aceptá. En el instalador de Visual Studio marcá la carga de trabajo **"Desarrollo para el escritorio con C++"** (*Desktop development with C++*).
3. Cuando termine, elegí la opción **1) Proceed with standard installation**.
4. **Cerrá y volvé a abrir** la terminal (PowerShell o Windows Terminal).

**Opción B: WSL (recomendada si ya usás Linux en Windows)**

1. En PowerShell como administrador:

   ```powershell
   wsl --install
   ```

2. Reiniciá, abrí **Ubuntu** desde el menú Inicio y seguí los pasos de **🐧 Linux** (también para la Stellar CLI).

</details>

## Paso 2 · Agregar el target de WebAssembly

Igual en todos los sistemas:

```bash
rustup target add wasm32v1-none
```

## Paso 3 · Instalar Stellar CLI

Elegí tu sistema operativo:

<details>
<summary><strong>🍎 macOS</strong></summary>

**Con Homebrew (recomendado):**

```bash
brew install stellar-cli
```

**Sin Homebrew (script oficial):**

```bash
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
```

</details>

<details>
<summary><strong>🐧 Linux</strong></summary>

**Script oficial (recomendado):**

```bash
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
```

**O con Homebrew** (si lo tenés instalado en Linux):

```bash
brew install stellar-cli
```

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

**Con winget (recomendado).** En PowerShell:

```powershell
winget install --id Stellar.StellarCLI
```

Después **cerrá y volvé a abrir** la terminal.

> También podés descargar el instalador desde [Releases de GitHub](https://github.com/stellar/stellar-cli/releases).

</details>

<details>
<summary><strong>🛠️ Cualquier sistema: compilar desde el código con Cargo</strong></summary>

Tarda varios minutos, pero funciona en cualquier sistema que tenga Rust.

En Linux, primero instalá las dependencias:

```bash
sudo apt install -y build-essential pkg-config libdbus-1-dev libudev-dev
```

Después:

```bash
cargo install --locked stellar-cli
```

</details>

## Paso 4 · Verificar todo

```bash
rustc --version
```

```bash
rustup target list --installed
```

```bash
stellar --version
```

Deberías ver `rustc 1.84.0` o superior, `wasm32v1-none` en la lista de targets y la versión de la CLI (compará con la última en [Releases](https://github.com/stellar/stellar-cli/releases)).

✅ **Prueba final:** desde la raíz del repo, entrá a los ejemplos de la clase:

```bash
cd class-1/soroban-basics
```

Corré los tests (prueba Rust):

```bash
cargo test
```

Compilá a WebAssembly (prueba la CLI y el target):

```bash
stellar contract build
```

## Paso 5 · Autocompletado de la CLI (opcional)

Permite completar comandos de `stellar` con `Tab`.

**zsh** (macOS por defecto):

```bash
echo "source <(stellar completion --shell zsh)" >> ~/.zshrc
```

**bash** (Linux / WSL):

```bash
echo "source <(stellar completion --shell bash)" >> ~/.bashrc
```

**PowerShell** (Windows):

```powershell
stellar completion --shell powershell | Out-String | Invoke-Expression
```

Abrí una terminal nueva para que tome efecto. Para que en PowerShell quede permanente, agregá esa línea a tu `$PROFILE`.

## Paso 6 · Primer uso: crear una cuenta en testnet

**Testnet** es la red de prueba de Stellar: funciona igual que la real, pero el dinero no tiene valor.

Crear una identidad llamada `alice` y fondearla con XLM de prueba:

```bash
stellar keys generate alice --network testnet --fund
```

Ver su dirección pública (empieza con `G...`):

```bash
stellar keys address alice
```

Podés buscar esa dirección en el explorador [stellar.expert (testnet)](https://stellar.expert/explorer/testnet) para ver el saldo.

## Problemas comunes

| Problema | Solución |
|---|---|
| `command not found: rustc` / `cargo` | Cerrá y abrí la terminal, o corré `source "$HOME/.cargo/env"`. |
| `rustc` es más viejo que 1.84 | `rustup update stable` |
| Tenés Rust instalado con Homebrew o apt | Desinstalalo y usá `rustup`: el de Homebrew/apt no permite agregar targets. |
| `linker 'cc' not found` (Linux) | `sudo apt install -y build-essential` |
| `link.exe not found` (Windows) | Instalá **Visual Studio C++ Build Tools** con "Desarrollo para el escritorio con C++". |
| `command not found: stellar` | Cerrá y abrí la terminal. Si instalaste con el script o Cargo, verificá que `~/.cargo/bin` (o `~/.local/bin`) esté en tu `PATH`. |
| `winget` no se reconoce (Windows) | Actualizá **App Installer** desde la Microsoft Store. |
| `cargo install` falla con `libudev` / `dbus` (Linux) | Instalá las dependencias de la opción 🛠️ del Paso 3. |
| `stellar contract build` falla por el target | Falta el Paso 2: `rustup target add wasm32v1-none`. |
| `--fund` falla | El servicio de fondeo de testnet (Friendbot) puede estar saturado: probá más tarde con `stellar keys fund alice --network testnet`. |

## Extra: editor recomendado

Cualquiera de estos dos, con la extensión **rust-analyzer** (autocompletado y errores en vivo):

- [Visual Studio Code](https://code.visualstudio.com/) → instalá [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) desde Extensiones.
- [Cursor](https://cursor.com/) (editor basado en VS Code, con IA integrada) → buscá **rust-analyzer** en Extensiones e instalala.

## Recursos oficiales

**Stellar**
- Setup oficial: <https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup>
- Documentación de la CLI: <https://developers.stellar.org/docs/tools/cli/stellar-cli>
- Repositorio y releases de la CLI: <https://github.com/stellar/stellar-cli>
- Primer contrato (Hello World): <https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world>
- Explorador de testnet: <https://stellar.expert/explorer/testnet>

**Rust**
- Instalación: <https://www.rust-lang.org/tools/install>
- Libro de rustup: <https://rust-lang.github.io/rustup/>
- Aprender Rust (libro oficial): <https://doc.rust-lang.org/book/>

➡️ **Siguiente paso:** [Soroban Basics](../soroban-basics/)
