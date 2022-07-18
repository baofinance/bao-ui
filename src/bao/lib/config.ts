import { Config } from './types'

export default {
  networkId: 1,
  defaultRpc: {
    chainId: '0x1',
    rpcUrls: ['https://rpc.ankr.com/eth'],
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
    // NFTs
    baoElder: '0x39c1f6e78c5200674c84c46dc5bf85ba9f6f630a',
    baoSwap: '0x36e58282a053f888881cdaa4ba4f44dc7af15024',
    //Baskets
    bDEFI: '0x583cb488eF632c3A959Aa19EcF7991731a2F728e',
    bSTBL: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
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
    wethPrice: {
      1: {
        address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        abi: 'chainoracle.json',
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
    // NFT
    nft: {
      1: {
        address: '0x39c1f6e78c5200674c84c46dc5bf85ba9f6f630a',
        abi: 'nft.json',
      },
    },
    nft2: {
      1: {
        address: '0x36e58282a053f888881cdaa4ba4f44dc7af15024',
        abi: 'nft.json',
      },
    },
    // Baskets
    recipe: {
      1: {
        address: '0xac0fE9F363c160c281c81DdC49d0AA8cE04C02Eb',
        abi: 'simpleUniRecipe.json',
      },
    },
    lendingRegistry: {
      1: {
        address: '0x08a2b7D713e388123dc6678168656659d297d397',
        abi: 'lendingRegistry.json',
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
    {
      mid: 5,
      symbol: 'bdSTBL',
      archived: true,
      marketAddresses: {
        1: '0xE0a55c00E6510F4F7df9af78b116B7f8E705cA8F',
      },
      underlyingAddresses: {
        1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
      },
      icon: '/bSTBL.png',
      coingeckoId: 'dai',
      underlyingDecimals: 18,
    },
  ],
  baskets: [
    /*{
      nid: 1,
      basketAddresses: {
        1: '0x583cb488eF632c3A959Aa19EcF7991731a2F728e',
      },
      lpAddress: '0x84e5bf858Ee50bE323143dF88f2089827834b9cE',
      ovenAddress: '0x30DE1e1e4a42557f31F038E3B77672Afd4eAF7DF',
      symbol: 'bDEFI',
      name: 'bDEFI',
      icon: '/bDEFI.png',
      cgIds: {
        '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B': 'convex-finance',
        '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': 'maker',
        '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
        '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
        '0x5a98fcbea516cf06857215779fd812ca3bef1b32': 'lido-dao',
        '0xc00e94cb662c3520282e6f5717214004a7f26888':
          'compound-governance-token',
        '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': 'sushi',
        '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 'yearn-finance',
        '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D': 'liquity',
        '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0': 'frax-share',
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'uniswap',
        '0xba100000625a3754423978a60c9317c58a424e3D': 'balancer',
      },
      pieColors: {
        aYFI: '#006AE3',
        MKR: '#63C3B2',
        CVX: '#3A3A3A',
        cAAVE: '#926BA8',
        LDO: '#00A3FF',
        LQTY: '#1442CC',
        UNI: '#FF047CFF',
        FXS: '#393835',
        cCOMP: '#00D395',
        xSUSHI: '#ea3fb4',
        BAL: '#1E1E1E',
        aCRV: '#F7E103',
      },
    },*/
    {
      nid: 1,
      basketAddresses: {
        1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
      },
      lpAddress: '0x562385758925CF0f1Cf3363124Fa9dED981d67e3',
      ovenAddress: '0x3F32068Fc7fff8d3218251561cd77EE2FefCb1A3',
      symbol: 'bSTBL',
      name: 'bSTBL',
      icon: '/bSTBL.png',
      cgIds: {
        '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919': 'rai',
        '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usd-coin',
      },
      pieColors: {
        aRAI: '#1FC9A8',
        aDAI: '#F5AC37',
        aUSDC: '#2775CA',
      },
      desc: 'Low risk stablecoin basket',
      swap: 'https://curve.fi/factory-crypto/61',
    },
  ],
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
      symbol: 'UNIV2',
      type: 'UNIV2',
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
      symbol: 'SLP',
      type: 'SLP',
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
      symbol: 'SLP',
      type: 'SLP',
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
