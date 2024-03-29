/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface SimpleUniRecipeInterface extends utils.Interface {
  functions: {
    "bake(address,uint256,uint256)": FunctionFragment;
    "basketRegistry()": FunctionFragment;
    "getPrice(address,uint256)": FunctionFragment;
    "getPriceUSD(address,uint256)": FunctionFragment;
    "lendingRegistry()": FunctionFragment;
    "oracle()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "toBasket(address,uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "uniRouter()": FunctionFragment;
    "updateUniOracle(address)": FunctionFragment;
    "updateUniRouter(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "bake"
      | "bake(address,uint256,uint256)"
      | "basketRegistry"
      | "basketRegistry()"
      | "getPrice"
      | "getPrice(address,uint256)"
      | "getPriceUSD"
      | "getPriceUSD(address,uint256)"
      | "lendingRegistry"
      | "lendingRegistry()"
      | "oracle"
      | "oracle()"
      | "owner"
      | "owner()"
      | "renounceOwnership"
      | "renounceOwnership()"
      | "toBasket"
      | "toBasket(address,uint256)"
      | "transferOwnership"
      | "transferOwnership(address)"
      | "uniRouter"
      | "uniRouter()"
      | "updateUniOracle"
      | "updateUniOracle(address)"
      | "updateUniRouter"
      | "updateUniRouter(address)"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "bake",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "bake(address,uint256,uint256)",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "basketRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "basketRegistry()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPrice",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPrice(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPriceUSD",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getPriceUSD(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "lendingRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lendingRegistry()",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;
  encodeFunctionData(functionFragment: "oracle()", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner()", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "toBasket",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "toBasket(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership(address)",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "uniRouter", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "uniRouter()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateUniOracle",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateUniOracle(address)",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateUniRouter",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "updateUniRouter(address)",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "bake", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "bake(address,uint256,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "basketRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "basketRegistry()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPrice(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriceUSD",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriceUSD(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lendingRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lendingRegistry()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "oracle()", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner()", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "toBasket", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "toBasket(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "uniRouter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "uniRouter()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateUniOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateUniOracle(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateUniRouter",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateUniRouter(address)",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "OwnershipTransferred(address,address)"
  ): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface SimpleUniRecipe extends BaseContract {
  contractName: "SimpleUniRecipe";

  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SimpleUniRecipeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    bake(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "bake(address,uint256,uint256)"(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    basketRegistry(overrides?: CallOverrides): Promise<[string]>;

    "basketRegistry()"(overrides?: CallOverrides): Promise<[string]>;

    getPrice(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "getPrice(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getPriceUSD(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "getPriceUSD(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    lendingRegistry(overrides?: CallOverrides): Promise<[string]>;

    "lendingRegistry()"(overrides?: CallOverrides): Promise<[string]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;

    "oracle()"(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    "owner()"(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "renounceOwnership()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    toBasket(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "toBasket(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "transferOwnership(address)"(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    uniRouter(overrides?: CallOverrides): Promise<[string]>;

    "uniRouter()"(overrides?: CallOverrides): Promise<[string]>;

    updateUniOracle(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "updateUniOracle(address)"(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    updateUniRouter(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "updateUniRouter(address)"(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  bake(
    _basket: PromiseOrValue<string>,
    _maxInput: PromiseOrValue<BigNumberish>,
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "bake(address,uint256,uint256)"(
    _basket: PromiseOrValue<string>,
    _maxInput: PromiseOrValue<BigNumberish>,
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  basketRegistry(overrides?: CallOverrides): Promise<string>;

  "basketRegistry()"(overrides?: CallOverrides): Promise<string>;

  getPrice(
    _basket: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "getPrice(address,uint256)"(
    _basket: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getPriceUSD(
    _basket: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "getPriceUSD(address,uint256)"(
    _basket: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  lendingRegistry(overrides?: CallOverrides): Promise<string>;

  "lendingRegistry()"(overrides?: CallOverrides): Promise<string>;

  oracle(overrides?: CallOverrides): Promise<string>;

  "oracle()"(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "renounceOwnership()"(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  toBasket(
    _basket: PromiseOrValue<string>,
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "toBasket(address,uint256)"(
    _basket: PromiseOrValue<string>,
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "transferOwnership(address)"(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  uniRouter(overrides?: CallOverrides): Promise<string>;

  "uniRouter()"(overrides?: CallOverrides): Promise<string>;

  updateUniOracle(
    _newOracle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "updateUniOracle(address)"(
    _newOracle: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  updateUniRouter(
    _newRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "updateUniRouter(address)"(
    _newRouter: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    bake(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        inputAmountUsed: BigNumber;
        outputAmount: BigNumber;
      }
    >;

    "bake(address,uint256,uint256)"(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        inputAmountUsed: BigNumber;
        outputAmount: BigNumber;
      }
    >;

    basketRegistry(overrides?: CallOverrides): Promise<string>;

    "basketRegistry()"(overrides?: CallOverrides): Promise<string>;

    getPrice(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPrice(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPriceUSD(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPriceUSD(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lendingRegistry(overrides?: CallOverrides): Promise<string>;

    "lendingRegistry()"(overrides?: CallOverrides): Promise<string>;

    oracle(overrides?: CallOverrides): Promise<string>;

    "oracle()"(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "renounceOwnership()"(overrides?: CallOverrides): Promise<void>;

    toBasket(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        inputAmountUsed: BigNumber;
        outputAmount: BigNumber;
      }
    >;

    "toBasket(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber] & {
        inputAmountUsed: BigNumber;
        outputAmount: BigNumber;
      }
    >;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferOwnership(address)"(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    uniRouter(overrides?: CallOverrides): Promise<string>;

    "uniRouter()"(overrides?: CallOverrides): Promise<string>;

    updateUniOracle(
      _newOracle: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    "updateUniOracle(address)"(
      _newOracle: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    updateUniRouter(
      _newRouter: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    "updateUniRouter(address)"(
      _newRouter: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    bake(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "bake(address,uint256,uint256)"(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    basketRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    "basketRegistry()"(overrides?: CallOverrides): Promise<BigNumber>;

    getPrice(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "getPrice(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getPriceUSD(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "getPriceUSD(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    lendingRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    "lendingRegistry()"(overrides?: CallOverrides): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;

    "oracle()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "renounceOwnership()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    toBasket(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "toBasket(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "transferOwnership(address)"(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    uniRouter(overrides?: CallOverrides): Promise<BigNumber>;

    "uniRouter()"(overrides?: CallOverrides): Promise<BigNumber>;

    updateUniOracle(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "updateUniOracle(address)"(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    updateUniRouter(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "updateUniRouter(address)"(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    bake(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "bake(address,uint256,uint256)"(
      _basket: PromiseOrValue<string>,
      _maxInput: PromiseOrValue<BigNumberish>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    basketRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "basketRegistry()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPrice(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "getPrice(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getPriceUSD(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "getPriceUSD(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    lendingRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "lendingRegistry()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "oracle()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "renounceOwnership()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    toBasket(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "toBasket(address,uint256)"(
      _basket: PromiseOrValue<string>,
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "transferOwnership(address)"(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    uniRouter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "uniRouter()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateUniOracle(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "updateUniOracle(address)"(
      _newOracle: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    updateUniRouter(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "updateUniRouter(address)"(
      _newRouter: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
