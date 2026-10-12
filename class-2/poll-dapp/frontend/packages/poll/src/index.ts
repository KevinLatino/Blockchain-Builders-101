import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCCORIES5EJWJIORNMBUZG2QSN7VWSXQNF2S4367UGNO6SRSA3EMIMBN",
  }
} as const


/**
 * Códigos FIJOS: el frontend los traduce a mensajes (Error(Contract, #2) = ya votaste).
 */
export const PollError = {
  1: {message:"InvalidOption"},
  2: {message:"AlreadyVoted"},
  3: {message:"NoOptions"}
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({voter, option}: {voter: string, option: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a has_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  has_voted: ({voter}: {voter: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_options transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_options: (options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a get_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Votos de cada opción, en el mismo orden que `get_options()`.
   */
  get_results: (options?: MethodOptions) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a get_question transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_question: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {question, choices}: {question: string, choices: Array<string>},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({question, choices}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAEdm90ZQAAAAIAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAGb3B0aW9uAAAAAAAEAAAAAQAAA+kAAAACAAAH0AAAAAlQb2xsRXJyb3IAAAA=",
        "AAAABQAAAExTZSBlbWl0ZSBlbiBjYWRhIHZvdG86IHVuIGluZGV4YWRvciBwdWVkZSByZWNvbnN0cnVpciBlbCBoaXN0b3JpYWwgY29uIGVzdG8uAAAAAAAAAAVWb3RlZAAAAAAAAAEAAAAFdm90ZWQAAAAAAAACAAAAAAAAAAV2b3RlcgAAAAAAABMAAAABAAAAAAAAAAZvcHRpb24AAAAAAAQAAAAAAAAAAg==",
        "AAAAAAAAAAAAAAAJaGFzX3ZvdGVkAAAAAAAAAQAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAALZ2V0X29wdGlvbnMAAAAAAAAAAAEAAAPqAAAAEA==",
        "AAAAAAAAAD1Wb3RvcyBkZSBjYWRhIG9wY2nDs24sIGVuIGVsIG1pc21vIG9yZGVuIHF1ZSBgZ2V0X29wdGlvbnMoKWAuAAAAAAAAC2dldF9yZXN1bHRzAAAAAAAAAAABAAAD6gAAAAQ=",
        "AAAABAAAAFZDw7NkaWdvcyBGSUpPUzogZWwgZnJvbnRlbmQgbG9zIHRyYWR1Y2UgYSBtZW5zYWplcyAoRXJyb3IoQ29udHJhY3QsICMyKSA9IHlhIHZvdGFzdGUpLgAAAAAAAAAAAAlQb2xsRXJyb3IAAAAAAAADAAAAAAAAAA1JbnZhbGlkT3B0aW9uAAAAAAAAAQAAAAAAAAAMQWxyZWFkeVZvdGVkAAAAAgAAAAAAAAAJTm9PcHRpb25zAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAMZ2V0X3F1ZXN0aW9uAAAAAAAAAAEAAAAQ",
        "AAAAAAAAALhTZSBlamVjdXRhIHVuYSBzb2xhIHZleiwgYWwgZGVzcGxlZ2FyLgooU2UgbGxhbWEgYGNob2ljZXNgIHkgbm8gYG9wdGlvbnNgOiBsb3MgYmluZGluZ3MgZGUgVHlwZVNjcmlwdCB5YSB1c2FuCmBvcHRpb25zYCBjb21vIG5vbWJyZSBkZSBwYXLDoW1ldHJvIHkgZWwgY8OzZGlnbyBnZW5lcmFkbyBubyBjb21waWxhcsOtYS4pAAAADV9fY29uc3RydWN0b3IAAAAAAAACAAAAAAAAAAhxdWVzdGlvbgAAABAAAAAAAAAAB2Nob2ljZXMAAAAD6gAAABAAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<Result<void>>,
        has_voted: this.txFromJSON<boolean>,
        get_options: this.txFromJSON<Array<string>>,
        get_results: this.txFromJSON<Array<u32>>,
        get_question: this.txFromJSON<string>
  }
}