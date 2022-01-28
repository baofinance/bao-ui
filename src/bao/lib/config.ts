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
    bUSD: '0x4ab319ae3ef47479c229fe742463b9b2cf1c7647',
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
    // Soft Synths
    recipe: {
      3: {
        address: '0x0C9DF041582741b9Ae384F31209A6Dc7ea6B9Bcb',
        abi: 'recipe.json',
      },
    },
    wethPrice: {
      3: {
        address: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        abi: 'chainoracle.json',
      },
    },
    basketRedeem: {
      3: {
        address: '0x174c726ED2E30560935247C410294DB5FfEa39D4',
        abi: 'nestRedeem.json',
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
        3: '0x4ab319ae3ef47479c229fe742463b9b2cf1c7647',
      },
      isSynth: true,
      icon: '/bUSD.png',
      coingeckoId: 'dai',
      decimals: 18,
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
      decimals: 18,
    },
    {
      mid: 3,
      symbol: 'bUSDC',
      marketAddresses: {
        3: '0xCaAd85c5a9f31c679742ea6f8654c3B53b4c6d7D',
      },
      underlyingAddresses: {
        3: '0x1c648c939578a4da0d7fb2384ddb3fce9439d28d',
      },
      icon: '/USDC.png',
      coingeckoId: 'usd-coin',
      decimals: 6,
    },
  ],
  baskets: [
    {
      nid: 1,
      basketAddresses: {
        3: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      },
      inputToken: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      outputToken: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      symbol: 'nDEFI',
      name: 'nDEFI',
      icon: '/ndefi.svg',
      pieColors: {
        SUSHI: '#DB5FA9',
        GRT: '#353993',
        LINK: '#2A5AD9',
        WETH: '#d05555',
        CVX: '#3d3939',
        CRV: '#F2E308',
        SNX: '#00D1FF',
        MKR: '#51AC9E',
        AAVE: '#9965A6',
        COMP: '#00D395',
        BAO: '#5D2B22',
        YFI: '#006AE3',
        ALCX: '#C59D7E',
        UNI: '#FF017A',
        WMATIC: '#8247E5',
        UMA: '#FF494A',
        ALPHA: '#27B2FE',
        BAL: '#b9b9b9',
      },
    },
    {
      nid: 2,
      basketAddresses: {
        3: '0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      },
      inputToken: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      outputToken: '0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      symbol: 'nSTBL',
      name: 'nSTBL',
      icon: '/nstbl.svg',
      pieColors: {
        DAI: '#F5AC37',
        USDT: '#50AF95',
        RAI: '#68FEE2',
        USDC: '#2775CA',
      },
    },
  ],
  farms: [
    // Incentivized pools
    {
      pid: 17,
      lpAddresses: {
        3: '0xf27c14aedad4c1cfa7207f826c64ade3d5c741c3',
      },
      tokenAddresses: {
        3: '0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      },
      tokenDecimals: 18,
      name: 'BAO-ETH',
      symbol: 'BAO-ETH SUSHI LP',
      tokenSymbol: 'BAO',
      icon: '/BAO.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0x4C392822D4bE8494B798cEA17B43d48B2308109C',
    },
    {
      pid: 18,
      lpAddresses: {
        3: '0x095fc71521668d5bcc0fc3e3a9848e8911af21d9',
      },
      tokenAddresses: {
        3: '0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      },
      tokenDecimals: 18,
      name: 'BAO-nDEFI',
      symbol: 'BAO-nDEFI SUSHI LP',
      tokenSymbol: 'BAO',
      icon: '/BAO.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      pairUrl:
        'https://app.sushi.com/add/0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B/0x4C392822D4bE8494B798cEA17B43d48B2308109C',
    },
    {
      pid: 19,
      lpAddresses: {
        3: '0xf70b37a372befe8c274a84375c233a787d0d4dfa',
      },
      tokenAddresses: {
        3: '0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      },
      tokenDecimals: 18,
      name: 'BAO-RAI',
      symbol: 'BAO-RAI SUSHI LP',
      tokenSymbol: 'BAO',
      icon: '/BAO.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x4C392822D4bE8494B798cEA17B43d48B2308109C',
      pairUrl:
        'https://app.sushi.com/add/0x00e5646f60ac6fb446f621d146b6e1886f002905/0x4C392822D4bE8494B798cEA17B43d48B2308109C',
    },
    {
      pid: 14,
      lpAddresses: {
        3: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      },
      tokenAddresses: {
        3: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      },
      tokenDecimals: 18,
      name: 'nDEFI',
      symbol: 'nDEFI',
      tokenSymbol: 'nDEFI',
      icon: '/nDEFI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      pairUrl: '#',
    },
    {
      pid: 15,
      lpAddresses: {
        3: '0xd0fa2eaa5d854f184394e93f7b75624084600685',
      },
      tokenAddresses: {
        3: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      },
      tokenDecimals: 18,
      name: 'nDEFI-RAI',
      symbol: 'nDEFI-RAI SUSHI LP',
      tokenSymbol: 'nDEFI',
      icon: '/nDEFI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      pairUrl:
        'https://app.sushi.com/add/0x00e5646f60ac6fb446f621d146b6e1886f002905/0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
    },
    {
      pid: 16,
      lpAddresses: {
        3: '0x1534d7c91bd77eb447acb7fb92ea042b918f58bb',
      },
      tokenAddresses: {
        3: '0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      },
      tokenDecimals: 18,
      name: 'nDEFI-ETH',
      symbol: 'nDEFI-ETH SUSHI LP',
      tokenSymbol: 'nDEFI',
      icon: '/nDEFI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0xd3f07EA86DDf7BAebEfd49731D7Bbd207FedC53B',
    },
    {
      pid: 23,
      lpAddresses: {
        3: '0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      },
      tokenAddresses: {
        3: '0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      },
      tokenDecimals: 18,
      name: 'nSTBL',
      symbol: 'nSTBL',
      tokenSymbol: 'nSTBL',
      icon: '/nSTBL.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      pairUrl: '#',
    },
    {
      pid: 24,
      lpAddresses: {
        3: '0x0c98d36908dfbe11C9A4d1F3CD8A9b94bAbA7521',
      },
      tokenAddresses: {
        3: '0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      },
      tokenDecimals: 18,
      name: 'nSTBL-ETH',
      symbol: 'nSTBL-ETH SUSHI LP',
      tokenSymbol: 'nSTBL',
      icon: '/nSTBL.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0x9Bf320bd1796a7495BB6187f9EB4Db2679b74eD3',
    },
    // Begin regular pools
    {
      pid: 22,
      lpAddresses: {
        3: '0x67cf45e239793a72f4bd4d46303735aeedf5d2b4',
      },
      tokenAddresses: {
        3: '0x00e5646f60ac6fb446f621d146b6e1886f002905',
      },
      tokenDecimals: 18,
      name: 'RAI-ETH',
      symbol: 'RAI-ETH SUSHI LP',
      tokenSymbol: 'RAI',
      icon: '/RAI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x00e5646f60ac6fb446f621d146b6e1886f002905',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0x00e5646f60ac6fb446f621d146b6e1886f002905',
    },
    {
      pid: 0,
      lpAddresses: {
        3: '0xdfa3ddd1807db8e4b4851d2e5421374e433a2983',
      },
      tokenAddresses: {
        3: '0xda537104d6a5edd53c6fbba9a898708e465260b6',
      },
      tokenDecimals: 18,
      name: 'YFI-ETH',
      symbol: 'YFI-ETH SUSHI LP',
      tokenSymbol: 'YFI',
      icon: '/YFI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xda537104d6a5edd53c6fbba9a898708e465260b6',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0xDA537104D6A5edd53c6fBba9A898708E465260b6',
    },
    {
      pid: 1,
      lpAddresses: {
        3: '0xce5b8977f5021f1ef1232b1d4a0cfd03e8bcba9b',
      },
      tokenAddresses: {
        3: '0x4257EA7637c355F81616050CbB6a9b709fd72683',
      },
      tokenDecimals: 18,
      name: 'CVX-ETH',
      symbol: 'CVX-ETH SUSHI LP',
      tokenSymbol: 'CVX',
      icon: '/CVX.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x4257EA7637c355F81616050CbB6a9b709fd72683',
      pairUrl:
        'https://app.sushi.com/add/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/0x4257EA7637c355F81616050CbB6a9b709fd72683',
    },
    {
      pid: 2,
      lpAddresses: {
        3: '0x5e5c517ec55d6393d91d6a1379e5ae393a01a423',
      },
      tokenAddresses: {
        3: '0x3AE490db48d74B1bC626400135d4616377D0109f',
      },
      tokenDecimals: 18,
      name: 'ALPHA-ETH',
      symbol: 'ALPHA-ETH SUSHI LP',
      tokenSymbol: 'ALPHA',
      icon: '/ALPHA.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x3AE490db48d74B1bC626400135d4616377D0109f',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x3AE490db48d74B1bC626400135d4616377D0109f',
    },
    {
      pid: 3,
      lpAddresses: {
        3: '0xc56060af39152c614fa67e169c0dd1809a886e4f',
      },
      tokenAddresses: {
        3: '0xb33eaad8d922b1083446dc23f610c2567fb5180f',
      },
      tokenDecimals: 18,
      name: 'UNI-ETH',
      symbol: 'UNI-ETH SUSHI LP',
      tokenSymbol: 'UNI',
      icon: '/UNI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xb33eaad8d922b1083446dc23f610c2567fb5180f',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0xb33eaad8d922b1083446dc23f610c2567fb5180f',
    },
    {
      pid: 4,
      lpAddresses: {
        3: '0xb5846453b67d0b4b4ce655930cf6e4129f4416d7',
      },
      tokenAddresses: {
        3: '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
      },
      tokenDecimals: 18,
      name: 'SUSHI-ETH',
      symbol: 'SUSHI-ETH SUSHI LP',
      tokenSymbol: 'SUSHI',
      icon: '/SUSHI.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a',
    },
    {
      pid: 5,
      lpAddresses: {
        3: '0x396e655c309676caf0acf4607a868e0cded876db',
      },
      tokenAddresses: {
        3: '0x172370d5cd63279efa6d502dab29171933a610af',
      },
      tokenDecimals: 18,
      name: 'CRV-ETH',
      symbol: 'CRV-ETH SUSHI LP',
      tokenSymbol: 'CRV',
      icon: '/CRV.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x172370d5cd63279efa6d502dab29171933a610af',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x172370d5cd63279efa6d502dab29171933a610af',
    },
    {
      pid: 6,
      lpAddresses: {
        3: '0xc67136e235785727a0d3b5cfd08325327b81d373',
      },
      tokenAddresses: {
        3: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
      },
      tokenDecimals: 18,
      name: 'BAL-ETH',
      symbol: 'BAL-ETH SUSHI LP',
      tokenSymbol: 'BAL',
      icon: '/BAL.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
    },
    {
      pid: 7,
      lpAddresses: {
        3: '0x9021a31062a1d9c9c35d632ed54a9d923e46809f',
      },
      tokenAddresses: {
        3: '0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c',
      },
      tokenDecimals: 18,
      name: 'COMP-ETH',
      symbol: 'COMP-ETH SUSHI LP',
      tokenSymbol: 'COMP',
      icon: '/COMP.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c',
    },
    {
      pid: 8,
      lpAddresses: {
        3: '0xbf61e1d82bd440cb9da11d325c046f029a663890',
      },
      tokenAddresses: {
        3: '0x6f7C932e7684666C9fd1d44527765433e01fF61d',
      },
      tokenDecimals: 18,
      name: 'MKR-ETH',
      symbol: 'MKR-ETH SUSHI LP',
      tokenSymbol: 'MKR',
      icon: '/MKR.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x6f7C932e7684666C9fd1d44527765433e01fF61d',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x6f7C932e7684666C9fd1d44527765433e01fF61d',
    },
    {
      pid: 9,
      lpAddresses: {
        3: '0x14dbe3e6814fd532ef87e4be9b4192c018752823',
      },
      tokenAddresses: {
        3: '0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89',
      },
      tokenDecimals: 18,
      name: 'ALCX-ETH',
      symbol: 'ALCX-ETH SUSHI LP',
      tokenSymbol: 'ALCX',
      icon: '/ALCX.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x95c300e7740D2A88a44124B424bFC1cB2F9c3b89',
    },
    {
      pid: 10,
      lpAddresses: {
        3: '0x74d23f21f780ca26b47db16b0504f2e3832b9321',
      },
      tokenAddresses: {
        3: '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
      },
      tokenDecimals: 18,
      name: 'LINK-ETH',
      symbol: 'LINK-ETH SUSHI LP',
      tokenSymbol: 'LINK',
      icon: '/LINK.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
    },
    {
      pid: 11,
      lpAddresses: {
        3: '0x116ff0d1caa91a6b94276b3471f33dbeb52073e7',
      },
      tokenAddresses: {
        3: '0x50b728d8d964fd00c2d0aad81718b71311fef68a',
      },
      tokenDecimals: 18,
      name: `SNX-ETH`,
      symbol: 'SNX-ETH SUSHI LP',
      tokenSymbol: 'SNX',
      icon: '/SNX.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x50b728d8d964fd00c2d0aad81718b71311fef68a',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x50b728d8d964fd00c2d0aad81718b71311fef68a',
    },
    {
      pid: 12,
      lpAddresses: {
        3: '0x6be10c5c7178af8c49997d07d6a5444c15e58170',
      },
      tokenAddresses: {
        3: '0x3066818837c5e6ed6601bd5a91b0762877a6b731',
      },
      tokenDecimals: 18,
      name: `UMA-ETH`,
      symbol: 'UMA-ETH SUSHI LP',
      tokenSymbol: 'UMA',
      icon: '/UMA.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0x3066818837c5e6ed6601bd5a91b0762877a6b731',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0x3066818837c5e6ed6601bd5a91b0762877a6b731',
    },
    {
      pid: 13,
      lpAddresses: {
        3: '0x2481cbe674fb72cf8cd3031ff4747078d168c9b3',
      },
      tokenAddresses: {
        3: '0xc81278a52AD0e1485B7C3cDF79079220Ddd68b7D',
      },
      tokenDecimals: 18,
      name: `BAO-ETH`,
      symbol: 'BAO-ETH SUSHI LP',
      tokenSymbol: 'BAO',
      icon: '/BAO.png',
      refUrl:
        'https://app.sushi.com/swap?inputCurrency=0x7ceb23fd6bc0add59e62ac25578270cff1b9f619&outputCurrency=0xc81278a52AD0e1485B7C3cDF79079220Ddd68b7D',
      pairUrl:
        'https://app.sushi.com/add/0x7ceb23fd6bc0add59e62ac25578270cff1b9f619/0xc81278a52AD0e1485B7C3cDF79079220Ddd68b7D',
    },
  ],
} as Config
