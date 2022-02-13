import { Config } from './types'

export default {
  networkId: 1,
  defaultRpc: {
    chainId: '0x1',
    rpcUrls: ['https://rpc.flashbots.net'],
    blockExplorerUrls: ['https://etherscan.io'],
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  addressMap: {
    uniswapFactory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    BAO: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    DEAD: '0x000000000000000000000000000000000000dead',
    //Synths
    baoUSD: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
  },
  contracts: {
    bao: {
      1: {
        address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
        abi: 'bao.json',
      },
    },
    masterChef: {
      1: {
        address: '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D',
        abi: 'masterchef.json',
      },
    },
    weth: {
      1: {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        abi: 'weth.json',
      },
    },
    // Hard Synths
    comptroller: {
      1: {
        address: '0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8',
        abi: 'comptroller.json',
      },
    },
    marketOracle: {
      1: {
        address: '0xEbdC2D2a203c17895Be0daCdf539eeFC710eaFd8',
        abi: 'marketOracle.json',
      },
    },
    stabilizer: {
      1: {
        address: '0x720282BB7e721634c95F0933636DE3171dc405de',
        abi: 'stabilizer.json',
      },
    },
  },
  subgraphs: {
    sushiExchange: {
      1: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
    },
    baoBurn: {
      1: 'https://api.thegraph.com/subgraphs/name/clabby/bao-burn',
    },
    baoMarkets: {
      1: 'https://api.thegraph.com/subgraphs/name/baofinance/bao-markets',
    },
  },
  markets: [
    {
      mid: 1,
      symbol: 'bdUSD',
      marketAddresses: {
        1: '0xc0601094C0C88264Ba285fEf0a1b00eF13e79347',
      },
      underlyingAddresses: {
        1: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
      },
      isSynth: true,
      icon: '/bUSD.png',
      coingeckoId: 'dai',
      underlyingDecimals: 18,
    },
    {
      mid: 4,
      symbol: 'bdETH',
      marketAddresses: {
        1: '0xF635fdF9B36b557bD281aa02fdfaeBEc04CD084A',
      },
      underlyingAddresses: {
        1: 'ETH',
      },
      icon: '/WETH.png',
      coingeckoId: 'weth',
      underlyingDecimals: 18,
    },
    {
      mid: 2,
      symbol: 'bdETH',
      archived: true,
      marketAddresses: {
        1: '0xe7a52262C1934951207c5fc7A944A82D283C83e5',
      },
      underlyingAddresses: {
        1: 'ETH',
      },
      icon: '/WETH.png',
      coingeckoId: 'weth',
      underlyingDecimals: 18,
    },
    {
      mid: 3,
      symbol: 'bdUSDC',
      marketAddresses: {
        1: '0x7749f9f3206A49d4c47b60db05716409dC3A4149',
      },
      underlyingAddresses: {
        1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      },
      icon: '/USDC.png',
      coingeckoId: 'usd-coin',
      underlyingDecimals: 6,
    },
  ],
  baskets: [],
  farms: [
    // Active pools
    {
      pid: 0,
      lpAddresses: {
        1: '0x9973bb0fe5f8df5de730776df09e946c74254fb3',
      },
      tokenAddresses: {
        1: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
      },
      tokenDecimals: 18,
      name: 'BAO-ETH UNIV2',
      symbol: 'BAO-ETH UNIV2',
      tokenSymbol: 'BAO',
      poolType: 'active',
      iconA: '/BAO.png',
      iconB: '/WETH.png',
      refUrl:
        'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
      pairUrl: '#',
    },
    {
      pid: 200,
      lpAddresses: {
        1: '0x0eee7f7319013df1f24f5eaf83004fcf9cf49245',
      },
      tokenAddresses: {
        1: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
      },
      tokenDecimals: 18,
      name: 'BAO-ETH SLP',
      symbol: 'BAO-ETH SLP',
      tokenSymbol: 'BAO',
      poolType: 'active',
      iconA: '/BAO.png',
      iconB: '/WETH.png',
      refUrl:
        'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
      pairUrl: '#',
    },
    {
      pid: 201,
      lpAddresses: {
        1: '0x072b999fc3d82f9ea08b8adbb9d63a980ff2b14d',
      },
      tokenAddresses: {
        1: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
      },
      tokenDecimals: 18,
      name: 'BAO-USDC SLP',
      symbol: 'BAO-USDC SLP',
      tokenSymbol: 'BAO',
      poolType: 'active',
      iconA: '/BAO.png',
      iconB: '/USDC.png',
      refUrl:
        'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
      pairUrl: '#',
    },
  ],
} as Config
