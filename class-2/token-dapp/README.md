# Token dApp · Stellar Testnet

Demo para la **Sesión 7: Integración de interfaz**. Una mini app de tokens SEP-41 sobre Testnet:

- Conectás tu wallet.
- Ves tu saldo (**lectura** del contrato).
- Enviás XLM a otra dirección (**escritura** del contrato).
- En cada paso ves en qué estado está la operación y, si algo falla, un error claro.

El contrato es el de **XLM nativo** (Stellar Asset Contract, que implementa SEP-41), así que no hay que desplegar nada.

## Qué tema de la clase está en cada archivo

| Tema | Archivos |
|---|---|
| 1. Arquitectura frontend, backend y Stellar | [`src/config.ts`](src/config.ts) · `.env.local` |
| 2. Conexión con billetera y flujo de firma | [`src/wallet/kit.ts`](src/wallet/kit.ts) · [`sign.ts`](src/wallet/sign.ts) · [`useWallet.ts`](src/wallet/useWallet.ts) |
| 3. Invocar el contrato | [`src/contract/client.ts`](src/contract/client.ts) · [`read.ts`](src/contract/read.ts) · [`write.ts`](src/contract/write.ts) |
| 4. Estados de carga, confirmación y error | [`src/tx/states.ts`](src/tx/states.ts) · [`errors.ts`](src/tx/errors.ts) |
| Interfaz | `src/components/` · [`src/app/page.tsx`](src/app/page.tsx) |

## Arquitectura

```text
┌──────────────── Navegador ─────────────────┐
│                                            │
│  Next.js (React)                           │        ┌───────────────┐
│    │                                       │  HTTP  │  Nodo RPC     │      ┌───────────┐
│    ├─ contract/ (bindings) ────────────────┼───────▶│  de Stellar   │─────▶│ Blockchain│
│    │     simular · enviar · consultar      │        │  (Testnet)    │      │  contrato │
│    │                                       │        └───────────────┘      │  SEP-41   │
│    └─ wallet/ ──▶ Wallet (Freighter, …)    │                               └───────────┘
│                   firma con la clave       │
│                   privada (nunca sale)     │
└────────────────────────────────────────────┘
```

**¿Por qué no hay backend?** La firma ocurre en la wallet del usuario, que vive en el navegador, y el nodo RPC de Stellar ya es una API pública: el navegador habla directo con la blockchain. Un servidor en el medio no agregaría seguridad (no tiene que guardar ninguna clave) y sí agregaría un punto de falla. Por eso todo lo de Stellar corre en componentes `"use client"`.

**¿Cuándo sí tendría sentido una API route de Next?**
- **Indexar eventos o historial:** el RPC solo guarda unos días de eventos; un backend puede guardarlos en una base de datos.
- **Patrocinar fees:** que la app pague las comisiones del usuario con una cuenta propia, cuya clave tiene que quedar en el servidor.
- **Guardar datos off-chain:** perfiles, nombres de contactos, metadata que no conviene poner en la blockchain.

## Requisitos

- **Node.js 20.9 o superior** (lo pide Next.js 16) y npm.
- **Stellar CLI** → [guía de instalación](../../class-1/setup/).
- **[Freighter](https://www.freighter.app/)** en el navegador, configurada en **Testnet**: *Settings → Network → Testnet*.

## Instalar y correr

```bash
cd class-2/token-dapp
```

```bash
cp .env.example .env.local
```

```bash
npm install
```

```bash
npm run dev
```

Abrí <http://localhost:3000>.

`npm install` también aplica un parche chico a Stellar Wallets Kit (`patches/`) que corrige un typo de CSS de la librería. Sin el parche, la consola muestra un warning.

## Configuración (`.env.local`)

| Variable | Valor en Testnet |
|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `NEXT_PUBLIC_CONTRACT_ID` | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

El contract ID del XLM nativo se obtiene con:

```bash
stellar contract id asset --asset native --network testnet
```

Llevan el prefijo `NEXT_PUBLIC_` porque se leen en el navegador. Si cambiás algún valor, reiniciá `npm run dev`.

## Generar los bindings del contrato

El cliente del contrato (`packages/xlm-token`) no se escribe a mano: lo genera la Stellar CLI leyendo la interfaz del contrato desplegado. Ya viene generado; para regenerarlo:

```bash
npm run bindings
```

El script hace dos cosas:
1. Corre `stellar contract bindings typescript --contract-id CDLZ… --network testnet --output-dir packages/xlm-token`.
2. Ajusta el `package.json` generado: le pone el nombre `xlm-token`, apunta al código TypeScript (Next lo compila gracias a `transpilePackages` en `next.config.ts`) y alinea la versión de `@stellar/stellar-sdk` con la de la app, para que haya **una sola copia** del SDK.

Después de regenerarlo, corré `npm install`.

## Preparar la demo

Necesitás **2 cuentas de Testnet**: una que envía (en Freighter) y otra que recibe.

**1. Cuenta que envía (Freighter)**
- En Freighter, con la red en Testnet, creá o elegí una cuenta.
- Conectala en la app. Si no tiene fondos, tocá **Fondear con Friendbot**: recibe 10.000 XLM de prueba.

**2. Cuenta que recibe (Stellar CLI)**

Creala y fondeala:

```bash
stellar keys generate receptor --network testnet --fund
```

Copiá su dirección para pegarla en el campo "Destino":

```bash
stellar keys address receptor
```

**3. Ensayo:** enviá 10 XLM, abrí el hash en Stellar Expert y verificá que el saldo bajó.

### Cómo provocar cada error en vivo

| Error | Cómo provocarlo |
|---|---|
| Firma cancelada | Tocá **Enviar** y rechazá en Freighter. |
| Cuenta sin fondos | Conectá una cuenta nueva de Freighter que nunca se fondeó. Aparece el botón de Friendbot. |
| El contrato rechazó la operación | Intentá enviar **todo** tu saldo: Stellar exige una reserva mínima en cada cuenta, y el contrato lo rechaza en la simulación (`Error(Contract, #10)`), antes de pedir la firma. |
| Red equivocada | Cambiá Freighter a Mainnet o Futurenet: aparece el aviso rojo y el envío se bloquea. |
| La red no respondió | Con el saldo ya cargado, cortá el wifi y tocá **Enviar**. También podés poner un RPC inválido en `.env.local` y reiniciar. |
| Validaciones del formulario | Dirección inválida (`GABC`), monto `0`, monto mayor al saldo, texto en el monto. |

## ⚠️ Testnet se reinicia

Testnet se resetea periódicamente: **todas las cuentas y saldos se borran**. Antes de la clase:

1. Revisá en <https://stellar.expert/explorer/testnet> que la red esté funcionando.
2. Abrí la app con tu cuenta de Freighter: si dice "Tu cuenta no tiene fondos", fondeala con Friendbot.
3. Volvé a fondear la cuenta receptora:
   ```bash
   stellar keys fund receptor --network testnet
   ```
4. Hacé una transferencia de prueba completa.

El contract ID del XLM nativo **no cambia** con los resets (se calcula a partir de la red y del asset), así que no hace falta regenerar los bindings.

## Estructura del código

```text
src/
  app/
    layout.tsx           → HTML base, fuente, metadata
    page.tsx             → arma la página con los componentes
  config.ts              → 1. Arquitectura: red, RPC, contract ID
  wallet/
    kit.ts               → 2. Setup de Stellar Wallets Kit (solo en el navegador)
    sign.ts              → 2. Flujo de firma
    useWallet.ts         → 2. Hook: dirección conectada y red
    friendbot.ts         → fondear cuentas de Testnet
  contract/
    client.ts            → 3. Cliente generado con bindings
    read.ts              → 3. Lectura: balance (simulación)
    write.ts             → 3. Escritura: transfer (construir → simular → firmar → enviar → confirmar)
    useBalance.ts        → hook del saldo
    amount.ts            → stroops ↔ XLM (7 decimales)
  tx/
    states.ts            → 4. Máquina de estados
    errors.ts            → 4. mapError()
    validate.ts          → validación del formulario
    useTransfer.ts       → hook que ejecuta la transferencia
  components/            → ConnectButton, NetworkBanner, BalanceCard, TransferForm, TxStatus
packages/
  xlm-token/             → cliente generado por `stellar contract bindings typescript`
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo |
| `npm run build` | Compila para producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm run bindings` | Regenera el cliente del contrato |

## Recursos

- Docs de smart contracts en Stellar: <https://developers.stellar.org/docs/build/smart-contracts>
- Stellar CLI: <https://developers.stellar.org/docs/tools/cli/stellar-cli>
- Stellar Wallets Kit: <https://stellarwalletskit.dev>
- SEP-41 (interfaz de tokens): <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md>
- SEP-43 (interfaz de wallets, códigos de error): <https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md>
- Explorador de Testnet: <https://stellar.expert/explorer/testnet>
