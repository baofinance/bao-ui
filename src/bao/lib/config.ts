import { Config } from './types'

export default {
  networkId: 3,
  defaultRpc: {
    chainId: '0x3',
    rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://ropsten.etherscan.io'],
    chainName: 'Ropsten Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  addressMap: {
    uniswapFactory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    uniswapFactoryV2: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    lendingLogicKashi: '0xcBA495A74e23D5B42853e41334e26DDd322Af082',
    baoUSD: '0x4ab319ae3ef47479c229fe742463b9b2cf1c7647',
    WETH: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    DEAD: '0x000000000000000000000000000000000000dead',
  },
  contracts: {
    polly: {
      3: {
        address: '0x4C392822D4bE8494B798cEA17B43d48B2308109C',
        abi: 'polly.json',
      },
    },
    masterChef: {
      3: {
        address: '0x850161bF73944a8359Bd995976a34Bb9fe30d398',
        abi: 'masterchef.json',
      },
    },
    weth: {
      3: {
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        abi: 'weth.json',
      },
    },
    // Hard Synths
    comptroller: {
      3: {
        address: '0x831e1605dd6a085e3b47f6f094df2fa3806d7143',
        abi: 'comptroller.json',
      },
    },
    marketOracle: {
      3: {
        address: '0xEbdC2D2a203c17895Be0daCdf539eeFC710eaFd8',
        abi: 'marketOracle.json',
      },
    },
    stabilizer: {
      3: {
        address: '0x7791528449cf1a9cec3de2f9ac9d915ccfd9a8d7',
        abi: 'stabilizer.json',
      },
    },
  },
  subgraphs: {
    sushiExchange: {
      3: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
      1: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange'
    },
    pollyBurn: {
      137: 'https://api.thegraph.com/subgraphs/name/clabby/polly-burn'
    },
    baoMarkets: {
      3: 'https://api.thegraph.com/subgraphs/name/clabby/bao-markets-ropsten-subgraph'
    }
  },
  markets: [
    {
      mid: 1,
      symbol: 'bUSD',
      marketAddresses: {
        3: '0xfD4cDC5129Dd794E26FD3764C8f2075EE13B9A53',
      },
      underlyingAddresses: {
        3: '0x4aB319aE3EF47479C229fE742463B9b2Cf1c7647',
      },
      isSynth: true,
      icon: '/bUSD.png',
      coingeckoId: 'dai',
      underlyingDecimals: 18,
    },
    {
      mid: 2,
      symbol: 'bETH',
      marketAddresses: {
        3: '0xd4E71A9D982b74110Cc3307d7D296927B3afBBDc',
      },
      underlyingAddresses: {
        3: 'ETH',
      },
      icon: '/WETH.png',
      coingeckoId: 'weth',
      underlyingDecimals: 18,
    },
    {
      mid: 3,
      symbol: 'bUSDC',
      marketAddresses: {
        3: '0xCaAd85c5a9f31c679742ea6f8654c3B53b4c6d7D',
      },
      underlyingAddresses: {
        3: '0x1c648C939578a4da0D7Fb2384DdB3FcE9439D28d',
      },
      icon: '/USDC.png',
      coingeckoId: 'usd-coin',
      underlyingDecimals: 6,
    },
  ],
  baskets: [],
  farms: [],
} as Config
