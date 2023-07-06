import { Config } from './types'

export default {
	networkId: 1,
	defaultRpc: {
		chainId: '0x1',
		rpcUrls: [process.env.NEXT_PUBLIC_ALCHEMY_API_URL],
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
		BAOv2: '0xCe391315b414D4c7555956120461D21808A69F3A',
		DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
		USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
		USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
		DEAD: '0x000000000000000000000000000000000000dead',
		CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
		MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
		//Synths
		baoUSD: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
		baoETH: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
		// NFTs
		baoElder: '0x39c1f6e78c5200674c84c46dc5bf85ba9f6f630a',
		baoSwap: '0x36e58282a053f888881cdaa4ba4f44dc7af15024',
		//Baskets
		bDEFI: '0x583cb488eF632c3A959Aa19EcF7991731a2F728e',
		bSTBL: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
		bETH: '0xa1e3F062CE5825c1e19207cd93CEFdaD82A8A631',
	},
	llamaIds: {
		wstETH: '747c1d2a-c668-4682-b9f9-296708a3dd90',
		rETH: 'd4b3c522-6127-4b89-bedf-83641cdcd2eb',
	},
	contracts: {
		Bao: {
			1: {
				address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
			},
		},
		Baov2: {
			1: {
				address: '0xCe391315b414D4c7555956120461D21808A69F3A',
			},
		},
		Masterchef: {
			1: {
				address: '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D',
			},
		},
		Weth: {
			1: {
				address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
			},
		},
		wethPrice: {
			1: {
				address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
			},
		},
		bSTBL: {
			1: {
				address: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
			},
		},
		baoUSD: {
			1: {
				address: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
			},
		},
		dai: {
			1: {
				address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
			},
		},
		// Baskets
		LendingRegistry: {
			1: {
				address: '0x08a2b7D713e388123dc6678168656659d297d397',
			},
		},
		// veBAO
		GaugeController: {
			1: {
				address: '0x840e75261c2934f33C8766F6eA6235330DC1D72d',
			},
		},
		votingEscrow: {
			1: {
				address: '0x8Bf70DFE40F07a5ab715F7e888478d9D3680a2B6',
			},
		},
		Minter: {
			1: {
				address: '0x7492Aa25Dcb4013925c199Ded466Fdf9baa6A380',
			},
		},
		FeeDistributor: {
			1: {
				address: '0xa1D0CCFcCb3064D4703060400F0D7E0FE0405e13',
			},
		},
		Dai: {
			1: {
				address: '0x6b175474e89094c44da98b954eedeac495271d0f',
			},
		},
		//Used for getting pool info for Curve LPs
		PoolInfo: {
			1: {
				address: '0xe64608E223433E8a03a1DaaeFD8Cb638C14B552C',
			},
		},
		// Distribution
		BaoDistribution: {
			1: {
				address: '0x885D90A424f87D362C9369C0F3d9A2d28AF495F4',
			},
		},
		Swapper: {
			1: {
				address: '0x235b30088E66d2D28F137b422B9349fBa51E0248',
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
		curve: {
			1: 'https://api.thegraph.com/subgraphs/name/messari/curve-finance-ethereum',
		},
	},
	vaults: {
		baoUSD: {
			vid: 1,
			comptroller: '0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8',
			oracle: '0xEbdC2D2a203c17895Be0daCdf539eeFC710eaFd8',
			stabilizer: '0x720282BB7e721634c95F0933636DE3171dc405de',
			markets: [
				{
					mid: 4,
					symbol: 'bdETH',
					vaultAddresses: {
						1: '0xF635fdF9B36b557bD281aa02fdfaeBEc04CD084A',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
				},
				{
					mid: 1,
					symbol: 'bdUSD',
					vaultAddresses: {
						1: '0xc0601094C0C88264Ba285fEf0a1b00eF13e79347',
					},
					underlyingAddresses: {
						1: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
					},
					isSynth: true,
					icon: 'baoUSD.png',
					coingeckoId: 'dai',
					underlyingSymbol: 'baoUSD',
					underlyingDecimals: 18,
					desc: 'Synthetic USD',
					minimumBorrow: 5000,
				},
				{
					mid: 3,
					symbol: 'bdUSDC',
					archived: true,
					vaultAddresses: {
						1: '0x7749f9f3206A49d4c47b60db05716409dC3A4149',
					},
					underlyingAddresses: {
						1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
					},
					icon: 'USDC.png',
					coingeckoId: 'usd-coin',
					underlyingDecimals: 6,
				},
				{
					mid: 5,
					isBasket: true,
					symbol: 'bdSTBL',
					vaultAddresses: {
						1: '0xE0a55c00E6510F4F7df9af78b116B7f8E705cA8F',
					},
					underlyingAddresses: {
						1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
					},
					icon: 'bSTBL.png',
					coingeckoId: 'dai',
					underlyingDecimals: 18,
				},
				{
					mid: 2,
					symbol: 'bdETH',
					archived: true,
					vaultAddresses: {
						1: '0xe7a52262C1934951207c5fc7A944A82D283C83e5',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
				},
			],
		},
		baoETH: {
			vid: 2,
			comptroller: '0x8e8C327AD3Fa97092cdAba70efCf82DaC3081fa1',
			oracle: '0xbCb0a842aF60c6F09827F34841d3A8770995c6e0',
			stabilizer: '0xC137fa40Ff0cb53ff157e1dCafc7262877069219',
			markets: [
				{
					mid: 4,
					symbol: 'bdEther',
					vaultAddresses: {
						1: '0x104079a87CE46fe2Cf27b811f6b406b69F6872B3',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
				},
				{
					mid: 1,
					symbol: 'bdbaoETH',
					vaultAddresses: {
						1: '0xe853E5c1eDF8C51E81bAe81D742dd861dF596DE7',
					},
					underlyingAddresses: {
						1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
					},
					isSynth: true,
					icon: 'baoETH.png',
					coingeckoId: 'dai',
					underlyingSymbol: 'baoETH',
					underlyingDecimals: 18,
					desc: 'Synthetic ETH',
					minimumBorrow: 3,
				},
				{
					mid: 2,
					symbol: 'bdbETH',
					vaultAddresses: {
						1: '0xf7548a6e9DAf2e4689CEDD8A08189d0D6f3Ee91b',
					},
					underlyingAddresses: {
						1: '0xa1e3f062ce5825c1e19207cd93cefdad82a8a631',
					},
					icon: 'bETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
					isBasket: true,
				},
				{
					mid: 3,
					symbol: 'bdbSTBL',
					vaultAddresses: {
						1: '0xb0f8Fe96b4880adBdEDE0dDF446bd1e7EF122C4e',
					},
					underlyingAddresses: {
						1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
					},
					icon: 'bSTBL.png',
					coingeckoId: 'dai',
					underlyingDecimals: 18,
					isBasket: true,
				},
			],
		},
	},
	gauges: [
		{
			gid: 1,
			gaugeAddresses: {
				1: '0x0a39eE038AcA8363EDB6876d586c5c7B9336a562',
			},
			poolAddresses: {
				1: '0x0fafafd3c393ead5f5129cfc7e0e12367088c473',
			},
			lpAddresses: {
				1: '0x0fafafd3c393ead5f5129cfc7e0e12367088c473',
			},
			poolInfoAddresses: {
				1: '0x127db66e7f0b16470bec194d0f496f9fa065d0a9',
			},
			name: 'baoUSD-3CRV',
			symbol: 'baoUSD3CRV',
			type: 'Curve',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/3CRV.png',
			pairUrl: 'https://curve.fi/#/ethereum/pools/factory-v2-84',
		},
		{
			gid: 2,
			gaugeAddresses: {
				1: '0x675F82DF9e2fC99F8E18D0134eDA68F9232c0Af9',
			},
			poolAddresses: {
				1: '0xa148bd19e26ff9604f6a608e22bfb7b772d0d1a3',
			},
			lpAddresses: {
				1: '0x7657ceb382013f1ce9ac7b08dd8db4f28d3a7538',
			},
			poolInfoAddresses: {
				1: '0xC4F389020002396143B863F6325aA6ae481D19CE',
			},
			name: 'bSTBL-DAI',
			symbol: 'bSTBLDAI',
			type: 'Curve',
			iconA: '/images/tokens/bSTBL.png',
			iconB: '/images/tokens/DAI.png',
			pairUrl: 'https://curve.fi/#/ethereum/pools/factory-crypto-61',
		},
		{
			gid: 3,
			gaugeAddresses: {
				1: '0xe7f3a90AEe824a55B0F8969b6e29698966EE0191',
			},
			poolAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			lpAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			poolInfoAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			name: 'BAO-ETH',
			symbol: 'BAOETH',
			type: 'Uniswap',
			iconA: '/images/tokens/BAO.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.uniswap.org/#/add/v2/0xCe391315b414D4c7555956120461D21808A69F3A/ETH',
		},
		// {
		// 	gid: 4,
		// 	gaugeAddresses: {
		// 		1: '0xFaf18D150fd1f031D1C7aCCb0a1cd93E67149597',
		// 	},
		// 	poolAddresses: {
		// 		1: '0x29ccdfc668569c2351c070255a2716ffb2bc8fb1',
		// 	},
		// 	lpAddresses: {
		// 		1: '0x67e07A06425E862C6eC922A9a54Bcb10BC97720d',
		// 	},
		// 	poolInfoAddresses: {
		// 		1: '0x29ccdfc668569c2351c070255a2716ffb2bc8fb1',
		// 	},
		// 	name: 'baoUSD-FRAXBP',
		// 	symbol: 'saddle-FRAXBP-baoUSD',
		// 	type: 'Saddle',
		// 	iconA: '/images/tokens/baoUSD.png',
		// 	iconB: '/images/tokens/saddleLPtoken.png',
		// 	pairUrl: 'https://saddle.exchange/#/pools/baoUSD-FRAXBP/deposit',
		// },
		{
			gid: 5,
			gaugeAddresses: {
				1: '0xdae71239d7f277824700dfc45b575e6aa21e2294',
			},
			poolAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			lpAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			poolInfoAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			name: 'baoUSD-LUSD',
			symbol: 'baoUSD-LUSD',
			type: 'Balancer',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/LUSD.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x7e9afd25f5ec0eb24d7d4b089ae7ecb9651c8b1f000000000000000000000511',
		},
		{
			gid: 6,
			gaugeAddresses: {
				1: '0x15174daafd4a72f282cf875a839d1abe9bf444c1',
			},
			poolAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			lpAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			poolInfoAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			name: 'baoETH-ETH',
			symbol: 'baoETH-ETH',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x1a44e35d5451e0b78621a1b3e7a53dfaa306b1d000000000000000000000051b',
		},
		{
			gid: 7,
			gaugeAddresses: {
				1: '0x8fbcb931409d7118949b92c0ed2d692f6bcb3d92',
			},
			poolAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			lpAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			poolInfoAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			name: 'baoUSD-LUSD/BAO',
			symbol: 'baoUSD-LUSD/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/LUSD.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x08cc92fedc1ce2d8525176a63fcff404450f2998000200000000000000000542',
		},
		{
			gid: 8,
			gaugeAddresses: {
				1: '0x0e7b7f385dc87e515b44e05233c340d474ea9d7c',
			},
			poolAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			lpAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			poolInfoAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			name: 'baoETH-ETH/BAO',
			symbol: 'baoETH-ETH/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x3b9fb87f7d081ceddb1289258fa5660d955317b6000200000000000000000544',
		},
		{
			gid: 9,
			gaugeAddresses: {
				1: '0x123Ec6701097d1C95771d0b8Fa48B0d88E7D7B62',
			},
			poolAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			lpAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			poolInfoAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			name: 'bETH/baoETH-ETH',
			symbol: 'bETH/baoETH-ETH',
			type: 'Balancer',
			iconA: '/images/tokens/bETH.png',
			iconB: '/images/tokens/baoETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x0bbc7b78ff8453c40718e290b33f1d00ee67274e000000000000000000000563',
		},
	],
	baskets: [
		{
			nid: 1,
			basketAddresses: {
				1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
			},
			lpAddress: '0x562385758925CF0f1Cf3363124Fa9dED981d67e3',
			recipeAddress: '0xac0fE9F363c160c281c81DdC49d0AA8cE04C02Eb',
			recipeVersion: 1,
			ovenAddress: '0x3F32068Fc7fff8d3218251561cd77EE2FefCb1A3',
			symbol: 'bSTBL',
			name: 'bSTBL',
			icon: 'bSTBL.png',
			cgIds: {
				'0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
				'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'usd-coin',
			},
			pieColors: {
				aSUSD: '#1FC9A8',
				aDAI: '#F5AC37',
				aUSDC: '#2775CA',
			},
			desc: 'Low risk stablecoin basket',
			swap: 'https://curve.fi/factory-crypto/61',
		},
		{
			nid: 2,
			basketAddresses: {
				1: '0xa1e3F062CE5825c1e19207cd93CEFdaD82A8A631',
			},
			lpAddress: '0x562385758925CF0f1Cf3363124Fa9dED981d67e3',
			recipeAddress: '0x600e353fa3414abdd08b5f20b20b4cd701823b9b',
			recipeVersion: 2,
			ovenAddress: '0x3F32068Fc7fff8d3218251561cd77EE2FefCb1A3',
			symbol: 'bETH',
			name: 'bETH',
			icon: 'bETH.png',
			cgIds: {
				'0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'wrapped-steth',
				'0xae78736cd615f374d3085123a210448e74fc6393': 'rocket-pool-eth',
			},
			pieColors: {
				wstETH: '#3AA4FF',
				rETH: '#F8AE8D',
			},
			desc: 'Liquid staked ETH basket',
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
			name: 'BAO-ETH',
			symbol: 'UNIV2',
			type: 'Uniswap v2 LP',
			tokenSymbol: 'BAO',
			poolType: 'active',
			iconA: '/images/tokens/BAO.png',
			iconB: '/images/tokens/ETH.png',
			refUrl: 'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
			pairUrl: 'https://app.uniswap.org/#/add/v2/0x374cb8c27130e2c9e04f44303f3c8351b9de61c1/ETH',
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
			name: 'BAO-ETH',
			symbol: 'SLP',
			type: 'SushiSwap LP',
			tokenSymbol: 'BAO',
			poolType: 'active',
			iconA: '/images/tokens/BAO.png',
			iconB: '/images/tokens/ETH.png',
			refUrl: 'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
			pairUrl: 'https://app.sushi.com/legacy/add/ETH/0x374CB8C27130E2c9E04F44303f3c8351B9De61C1?chainId=1',
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
			name: 'BAO-USDC',
			symbol: 'SLP',
			type: 'SushiSwap LP',
			tokenSymbol: 'BAO',
			poolType: 'active',
			iconA: '/images/tokens/BAO.png',
			iconB: '/images/tokens/USDC.png',
			refUrl: 'https://1inch.exchange/#/r/0x3bC3c8aF8CFe3dFC9bA1A57c7C3b653e3f6d6951/ETH/BAO',
			pairUrl:
				'https://app.sushi.com/legacy/add/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/0x374CB8C27130E2c9E04F44303f3c8351B9De61C1?chainId=1',
		},
	],
	nfts: [
		{
			nid: 1,
			address: {
				1: '0x39c1f6e78c5200674c84c46dc5bf85ba9f6f630a',
			},
			name: 'Bao Elder NFT',
			image: '/images/nft/baoelder.png',
			whitelist: 'baoElderWL.ts',
			opensea: 'BaoElder',
			description: 'OG Bao Farmers',
		},
		{
			nid: 2,
			address: {
				1: '0x36e58282a053f888881cdaa4ba4f44dc7af15024',
			},
			name: 'BaoSwap NFT',
			image: '/images/nft/baoswap.png',
			whitelist: 'baoSwapWL.ts',
			opensea: 'BaoGnosis',
			description: 'Users of Bao on Gnosis Chain',
		},
	],
} as unknown as Config
