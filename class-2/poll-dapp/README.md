# Votación en vivo · Stellar Testnet

Demo para la **Sesión 7: Integración de interfaz**. El público vota desde su wallet y los resultados se actualizan en vivo en la pantalla:

- Un **contrato propio** en Soroban (`contracts/poll`) guarda la pregunta, las opciones y los votos.
- La **dApp** (Next.js) lee los resultados sin firma y escribe un voto **con firma** de la wallet.
- **Modo pantalla** (`?modo=pantalla`) con barras grandes y un QR para entrar a votar.

## Qué tema de la clase está en cada archivo

| Tema | Archivos |
|---|---|
| Smart contract (Soroban) | [`contracts/poll/src/lib.rs`](contracts/poll/src/lib.rs) · [`test.rs`](contracts/poll/src/test.rs) |
| 1. Arquitectura frontend, backend y Stellar | [`src/config.ts`](src/config.ts) · `.env.local` |
| 2. Conexión con billetera y flujo de firma | [`src/wallet/kit.ts`](src/wallet/kit.ts) · [`sign.ts`](src/wallet/sign.ts) · [`useWallet.ts`](src/wallet/useWallet.ts) |
| 3. Invocar el contrato | [`src/contract/client.ts`](src/contract/client.ts) · [`read.ts`](src/contract/read.ts) · [`write.ts`](src/contract/write.ts) |
| 4. Estados de carga, confirmación y error | [`src/tx/states.ts`](src/tx/states.ts) · [`errors.ts`](src/tx/errors.ts) |
| Interfaz | `src/components/` · [`src/app/page.tsx`](src/app/page.tsx) |

## Arquitectura

```text
┌──────────── Navegador del estudiante ────────────┐
│                                                  │
│  dApp (Next.js, servida por Vercel)              │       ┌─────────────┐      ┌──────────────┐
│    ├─ contract/ (bindings) ──────────────────────┼──────▶│  Nodo RPC   │─────▶│  Blockchain  │
│    │    leer: get_results  (simulación, gratis)  │ HTTPS │  de Stellar │      │  contrato    │
│    │    escribir: vote     (transacción firmada) │       │  (Testnet)  │      │  poll        │
│    └─ wallet/ ──▶ Freighter: firma con la clave  │       └─────────────┘      └──────────────┘
│                   privada (nunca sale de ahí)    │
└──────────────────────────────────────────────────┘
```

**¿Por qué no hay backend?** La firma ocurre en la wallet del usuario, que vive en el navegador, y el nodo RPC de Stellar ya es una API pública: el navegador habla directo con la blockchain. Vercel solo **sirve los archivos** de la app; no ejecuta lógica de Stellar ni guarda claves. Por eso todo lo de Stellar corre en componentes `"use client"`.

**¿Cuándo sí tendría sentido una API route de Next?**
- **Indexar eventos o historial:** el contrato emite un evento `Voted` por cada voto. El RPC guarda eventos solo unos días; un backend puede guardarlos en una base de datos (por ejemplo, para mostrar "quién votó cuándo").
- **Patrocinar fees:** que la app pague las comisiones de los votantes con una cuenta propia, cuya clave tiene que quedar en el servidor.
- **Guardar datos off-chain:** perfiles, encuestas pasadas, metadata que no conviene poner en la blockchain.

## Requisitos

- **Node.js 20.9 o superior** (lo pide Next.js 16) y npm.
- **Rust** con el target `wasm32v1-none` y la **Stellar CLI** → [guía de instalación](../../class-1/setup/).
- **[Freighter](https://www.freighter.app/)** configurada en **Testnet**: *Settings → Network → Testnet*.

## 1. El contrato

Todos los comandos se corren desde `class-2/poll-dapp`.

**Tests:**

```bash
cargo test
```

**Compilar a WebAssembly** (genera `target/wasm32v1-none/release/poll.wasm`):

```bash
stellar contract build
```

**Desplegar en Testnet** con los argumentos del constructor (`alice` es una identidad de la CLI con fondos; ver [crear una cuenta](#crear-una-cuenta-de-la-cli)):

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/poll.wasm \
  --source-account alice \
  --network testnet \
  --alias poll \
  -- \
  --question "¿Qué lenguaje aprendieron primero?" \
  --choices '["Python","JavaScript","Java","C / C++"]'
```

El comando imprime el **contract ID** (`C…`). `--alias poll` lo guarda en tu CLI para usarlo por nombre:

```bash
stellar contract invoke --id poll --source-account alice --network testnet -- get_results
```

> **¿Por qué `--choices` y no `--options`?** El generador de bindings de TypeScript ya usa `options` como nombre de parámetro, y si el constructor también tiene un argumento `options`, el código generado no compila (`Duplicate identifier 'options'`). Por eso el argumento del constructor se llama `choices`; la función de lectura sigue siendo `get_options()`.

### Crear una cuenta de la CLI

```bash
stellar keys generate alice --network testnet --fund
```

### Errores del contrato

| Código | Error | Cuándo |
|---|---|---|
| `Error(Contract, #1)` | `InvalidOption` | La opción no existe. |
| `Error(Contract, #2)` | `AlreadyVoted` | Esa cuenta ya votó. |
| `Error(Contract, #3)` | `NoOptions` | Se intentó desplegar sin opciones. |

## 2. Generar los bindings

El cliente del contrato (`./poll`) no se escribe a mano: lo genera la Stellar CLI a partir del contrato desplegado.

```bash
npm run bindings
```

Que corre:

```bash
stellar contract bindings typescript --network testnet --contract-id poll --output-dir ./poll --overwrite
```

y además ajusta el `package.json` generado: lo apunta al código TypeScript (Next lo compila con `transpilePackages`) y alinea la versión de `@stellar/stellar-sdk` con la de la app, para que haya **una sola copia** del SDK. Después ejecuta `npm install`.

Solo hace falta regenerarlos si **cambia la interfaz** del contrato (funciones, argumentos, errores). Si despliegas el mismo contrato de nuevo, alcanza con cambiar `NEXT_PUBLIC_CONTRACT_ID`.

## 3. Correr en local

```bash
cp .env.example .env.local
```

Pon tu contract ID en `NEXT_PUBLIC_CONTRACT_ID` y después:

```bash
npm install
```

```bash
npm run dev
```

Abre <http://localhost:3000>. El modo pantalla está en <http://localhost:3000/?modo=pantalla>.

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `NEXT_PUBLIC_CONTRACT_ID` | El ID que imprimió el deploy (`stellar contract alias show poll --network testnet`) |
| `NEXT_PUBLIC_APP_URL` | *(Opcional)* URL que muestra el QR. Si no está, usa la URL actual. |

Llevan el prefijo `NEXT_PUBLIC_` porque se leen en el navegador, y Next las **inserta al compilar**: si cambias alguna, hay que reiniciar `npm run dev` (o volver a desplegar en Vercel).

`npm install` también aplica un parche chico a Stellar Wallets Kit (`patches/`) que corrige un typo de CSS de la librería.

## 4. Publicar en Vercel

El público entra desde su laptop a la URL de Vercel (HTTPS), así que no hace falta estar en la misma red.

1. En [vercel.com/new](https://vercel.com/new), importa el repositorio.
2. **Root Directory:** `class-2/poll-dapp` (el repo tiene más carpetas).
3. **Framework:** Next.js (se detecta solo). No hace falta tocar los comandos de build.
4. **Environment Variables:** carga las 4 variables `NEXT_PUBLIC_*` de la tabla de arriba.
5. **Deploy.**

Vercel instala desde el registry de JSR gracias al `.npmrc` del proyecto, y el `postinstall` aplica el parche. Verificamos el proceso con una instalación limpia (`npm ci` + `npm run build`), igual a la de Vercel.

El QR del modo pantalla toma solo la URL del deploy (`https://…vercel.app`). Si usas un dominio propio, ponlo en `NEXT_PUBLIC_APP_URL`.

## 5. Durante la clase

1. Proyecta **`https://<tu-app>.vercel.app/?modo=pantalla`**: pregunta, barras y el QR para entrar.
2. Los estudiantes escanean el QR o escriben la URL, conectan **Freighter en Testnet** y votan.
3. Las barras se actualizan solas cada 5 segundos (leer es gratis: no hay firma).

### Que cada estudiante tenga fondos

Para votar, la cuenta tiene que existir en Testnet. Si no tiene fondos, la app muestra **"Tu cuenta todavía no tiene fondos."** con un botón **Fondear con Friendbot**, que la fondea y reintenta el voto. Freighter también tiene un botón para fondear cuentas de Testnet.

### Cómo provocar cada error en vivo

| Error | Cómo provocarlo |
|---|---|
| "Cancelaste la firma en tu wallet." | Toca **Votar** y rechaza en Freighter. |
| "Tu cuenta todavía no tiene fondos." | Vota con una cuenta nueva de Freighter que nunca se fondeó. |
| "Ya votaste en esta encuesta." | Vota con una cuenta y después inténtalo de nuevo desde **otra pestaña** que todavía no se actualizó. La simulación lo rechaza **sin pedir firma** (`Error(Contract, #2)`). |
| "Esa opción no existe." | Con la CLI: `stellar contract invoke --id poll --source-account alice --network testnet -- vote --voter alice --option 9`. |
| "Tu wallet está en otra red. Cámbiala a Testnet." | Cambia Freighter a Mainnet o Futurenet: aparece el aviso rojo y el voto se bloquea. |
| "La red no respondió" | Corta el wifi y toca **Votar**. |

## ⚠️ Antes de la clase

**Arrancar con la encuesta en cero.** Los votos de los ensayos quedan guardados en el contrato. Para empezar de cero, despliega un contrato nuevo (mismo comando del paso 1) y actualiza `NEXT_PUBLIC_CONTRACT_ID` en `.env.local` y en Vercel → *Redeploy*. Como la interfaz no cambia, no hace falta regenerar los bindings.

**Testnet se reinicia periódicamente** y borra **todo**: cuentas, saldos y contratos desplegados. Revisa en <https://stellar.expert/explorer/testnet> que la red funcione, y si hubo un reset:

1. Vuelve a fondear tu cuenta de la CLI:
   ```bash
   stellar keys fund alice --network testnet
   ```
2. Vuelve a desplegar el contrato (paso 1) y actualiza `NEXT_PUBLIC_CONTRACT_ID`.
3. Vota una vez de prueba desde Freighter.

## Estructura del código

```text
contracts/poll/src/
  lib.rs                 → contrato: constructor, vote, get_results, get_question, get_options, has_voted
  test.rs                → tests (cargo test)
poll/                    → cliente TypeScript generado (npm run bindings)
src/
  app/
    layout.tsx           → HTML base, fuente, metadata
    page.tsx             → arma la página: vista normal o ?modo=pantalla
  config.ts              → 1. Arquitectura: red, RPC, contract ID
  wallet/
    kit.ts               → 2. Setup de Stellar Wallets Kit (solo en el navegador)
    sign.ts              → 2. Flujo de firma
    useWallet.ts         → 2. Hook: dirección conectada y red
    friendbot.ts         → fondear cuentas de Testnet
  contract/
    client.ts            → 3. Cliente generado con bindings
    read.ts              → 3. Lectura: get_results, get_question, get_options, has_voted
    write.ts             → 3. Escritura: client.vote() + tx.signAndSend()
    usePoll.ts           → resultados en vivo (cada 5 s)
    useHasVoted.ts       → ¿la cuenta ya votó?
  tx/
    states.ts            → 4. Máquina de estados
    errors.ts            → 4. mapError()
    useVote.ts           → ejecuta el voto y expone su estado
  components/            → ConnectButton, NetworkBanner, VotePanel, PollResults,
                           TxStatus, ScreenView, JoinQR
```

## Notas técnicas

- **Stellar Wallets Kit desde JSR** (`@creit-tech/stellar-wallets-kit`). No usamos `defaultModules()`: en la versión de JSR incluye el módulo de MetaMask, que importa el kit con su nombre viejo de npm (`@creit.tech/...`) y rompe el build. Por eso importamos las wallets una por una (Freighter, xBull, Lobstr, Albedo, Hana).
- **`signAndSend()` no lanza un error si la transacción falla en la red**: `write.ts` revisa el estado final (`SUCCESS`) y, si no, muestra el error con el hash.
- **Errores antes de firmar:** `write.ts` revisa la simulación antes de pedir la firma. Así "Ya votaste" y "Esa opción no existe" aparecen sin abrir la wallet ni gastar nada.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo |
| `npm run build` | Compila para producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm run bindings` | Regenera el cliente del contrato |
| `cargo test` | Corre los tests del contrato |
| `stellar contract build` | Compila el contrato a `.wasm` |

## Recursos

- Smart contracts en Stellar: <https://developers.stellar.org/docs/build/smart-contracts>
- Stellar CLI: <https://developers.stellar.org/docs/tools/cli/stellar-cli>
- Stellar Wallets Kit: <https://stellarwalletskit.dev>
- SEP-43 (interfaz de wallets, códigos de error): <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md>
- Deploy de Next.js en Vercel: <https://vercel.com/docs/frameworks/full-stack/nextjs>
- Explorador de Testnet: <https://stellar.expert/explorer/testnet>
