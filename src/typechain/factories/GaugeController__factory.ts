/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  GaugeController,
  GaugeControllerInterface,
} from "../GaugeController";

const _abi = [
  {
    name: "CommitOwnership",
    inputs: [
      {
        type: "address",
        name: "admin",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "ApplyOwnership",
    inputs: [
      {
        type: "address",
        name: "admin",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AddType",
    inputs: [
      {
        type: "string",
        name: "name",
        indexed: false,
      },
      {
        type: "int128",
        name: "type_id",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewTypeWeight",
    inputs: [
      {
        type: "int128",
        name: "type_id",
        indexed: false,
      },
      {
        type: "uint256",
        name: "time",
        indexed: false,
      },
      {
        type: "uint256",
        name: "weight",
        indexed: false,
      },
      {
        type: "uint256",
        name: "total_weight",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewGaugeWeight",
    inputs: [
      {
        type: "address",
        name: "gauge_address",
        indexed: false,
      },
      {
        type: "uint256",
        name: "time",
        indexed: false,
      },
      {
        type: "uint256",
        name: "weight",
        indexed: false,
      },
      {
        type: "uint256",
        name: "total_weight",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "VoteForGauge",
    inputs: [
      {
        type: "uint256",
        name: "time",
        indexed: false,
      },
      {
        type: "address",
        name: "user",
        indexed: false,
      },
      {
        type: "address",
        name: "gauge_addr",
        indexed: false,
      },
      {
        type: "uint256",
        name: "weight",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewGauge",
    inputs: [
      {
        type: "address",
        name: "addr",
        indexed: false,
      },
      {
        type: "int128",
        name: "gauge_type",
        indexed: false,
      },
      {
        type: "uint256",
        name: "weight",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "_token",
      },
      {
        type: "address",
        name: "_voting_escrow",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    name: "commit_transfer_ownership",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "apply_transfer_ownership",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "gauge_types",
    outputs: [
      {
        type: "int128",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "_addr",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "add_gauge",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
      {
        type: "int128",
        name: "gauge_type",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_gauge",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
      {
        type: "int128",
        name: "gauge_type",
      },
      {
        type: "uint256",
        name: "weight",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "checkpoint",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "checkpoint_gauge",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "gauge_relative_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauge_relative_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
      {
        type: "uint256",
        name: "time",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauge_relative_weight_write",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "gauge_relative_weight_write",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
      {
        type: "uint256",
        name: "time",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_type",
    outputs: [],
    inputs: [
      {
        type: "string",
        name: "_name",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_type",
    outputs: [],
    inputs: [
      {
        type: "string",
        name: "_name",
      },
      {
        type: "uint256",
        name: "weight",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "change_type_weight",
    outputs: [],
    inputs: [
      {
        type: "int128",
        name: "type_id",
      },
      {
        type: "uint256",
        name: "weight",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "change_gauge_weight",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
      {
        type: "uint256",
        name: "weight",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "vote_for_gauge_weights",
    outputs: [],
    inputs: [
      {
        type: "address",
        name: "_gauge_addr",
      },
      {
        type: "uint256",
        name: "_user_weight",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "get_gauge_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "addr",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "get_type_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "int128",
        name: "type_id",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "get_total_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "get_weights_sum_per_type",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "int128",
        name: "type_id",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "admin",
    outputs: [
      {
        type: "address",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "future_admin",
    outputs: [
      {
        type: "address",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "token",
    outputs: [
      {
        type: "address",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "voting_escrow",
    outputs: [
      {
        type: "address",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "n_gauge_types",
    outputs: [
      {
        type: "int128",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "n_gauges",
    outputs: [
      {
        type: "int128",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauge_type_names",
    outputs: [
      {
        type: "string",
        name: "",
      },
    ],
    inputs: [
      {
        type: "int128",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "gauges",
    outputs: [
      {
        type: "address",
        name: "",
      },
    ],
    inputs: [
      {
        type: "uint256",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "vote_user_slopes",
    outputs: [
      {
        type: "uint256",
        name: "slope",
      },
      {
        type: "uint256",
        name: "power",
      },
      {
        type: "uint256",
        name: "end",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "arg0",
      },
      {
        type: "address",
        name: "arg1",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "vote_user_power",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "last_user_vote",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "arg0",
      },
      {
        type: "address",
        name: "arg1",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "points_weight",
    outputs: [
      {
        type: "uint256",
        name: "bias",
      },
      {
        type: "uint256",
        name: "slope",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "arg0",
      },
      {
        type: "uint256",
        name: "arg1",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "time_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "address",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "points_sum",
    outputs: [
      {
        type: "uint256",
        name: "bias",
      },
      {
        type: "uint256",
        name: "slope",
      },
    ],
    inputs: [
      {
        type: "int128",
        name: "arg0",
      },
      {
        type: "uint256",
        name: "arg1",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "time_sum",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "uint256",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "points_total",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "uint256",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "time_total",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "points_type_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "int128",
        name: "arg0",
      },
      {
        type: "uint256",
        name: "arg1",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "time_type_weight",
    outputs: [
      {
        type: "uint256",
        name: "",
      },
    ],
    inputs: [
      {
        type: "uint256",
        name: "arg0",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class GaugeController__factory {
  static readonly abi = _abi;
  static createInterface(): GaugeControllerInterface {
    return new utils.Interface(_abi) as GaugeControllerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GaugeController {
    return new Contract(address, _abi, signerOrProvider) as GaugeController;
  }
}
