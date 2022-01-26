import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import Config from '../../src/bao/lib/config'
import BigNumber from 'bignumber.js'

// TODO- Move Apollo Clients to provider so that the chain can be switched
const clients: any = Object.keys(Config.subgraphs).reduce((prev, current) => {
  const _clients = Object.keys(Config.subgraphs[current]).reduce(
    (_prev, _current: string) => {
      return {
        ..._prev,
        [_current]: {
          client: new ApolloClient({
            uri: Config.subgraphs[current][parseInt(_current)],
            cache: new InMemoryCache(),
          }),
        },
      }
    },
    {},
  )
  return {
    ...prev,
    [current]: {
      ..._clients,
    },
  }
}, {})

const _getClient = (clientName: string, network: number) =>
  clients[clientName][network].client

const _querySubgraph = (
  query: string,
  clientName = 'sushiExchange',
  networkId = Config.networkId,
  _client?: ApolloClient<any>,
) => {
  const client = _client || _getClient(clientName, networkId)
  return new Promise((resolve, reject) => {
    client
      .query({
        query: gql(query),
      })
      .then(({ data }: any) => resolve(data))
      .catch((err: any) => reject(err))
  })
}

const getPriceHistoryMultiple = async (
  tokenAddresses: string[],
  networkId = 1,
  first?: number,
): Promise<any> =>
  await _querySubgraph(
    _getPriceHistoryQueryMultiple(tokenAddresses, first),
    'sushiExchange',
    networkId,
  )

const getPriceHistory = async (
  tokenAddress: string,
  networkId = 1,
): Promise<any> =>
  await _querySubgraph(
    _getPriceHistoryQuery(tokenAddress),
    'sushiExchange',
    networkId,
  )

// This is janky, will remove once the sushi subgraph syncs USD prices for most of our tokens
const getPriceFromPair = async (
  wethPrice: BigNumber,
  tokenAddress: string,
  networkId = 1,
) => {
  const data: any = await _querySubgraph(
    _getPriceFromPair(tokenAddress.toLowerCase()),
    'sushiExchange',
    networkId,
  )
  if (!data.token) return

  const quotePair: any = data.token.basePairs
    .concat(data.token.quotePairs)
    .find((pair: any) => {
      return (
        pair.token0.symbol.toLowerCase().includes('eth') ||
        pair.token1.symbol.toLowerCase().includes('eth')
      )
    })
  if (!quotePair) return

  const wethPerToken = quotePair.token0.symbol.toLowerCase().includes('eth')
    ? quotePair.token0Price
    : quotePair.token1Price

  return wethPrice.times(wethPerToken)
}

const getPriceFromPairMultiple = async (
  wethPrice: BigNumber,
  tokenAddresses: string[],
  networkId = 1,
): Promise<Array<{ address: string; price: BigNumber }>> => {
  const data: any = await _querySubgraph(
    _getPriceFromPairMultiple(
      tokenAddresses.map((tokenAddress) => tokenAddress.toLowerCase()),
    ),
    'sushiExchange',
    networkId,
  )
  if (!data.tokens) return

  const prices: any[] = []
  data.tokens.forEach((token: any) => {
    const quotePair: any = token.basePairs
      .concat(token.quotePairs)
      .find((pair: any) => {
        return (
          pair.token0.symbol.toLowerCase().includes('eth') ||
          pair.token1.symbol.toLowerCase().includes('eth')
        )
      })
    if (!quotePair) return

    const wethPerToken = quotePair.token0.symbol.toLowerCase().includes('eth')
      ? quotePair.token0Price
      : quotePair.token1Price

    prices.push({
      address: token.id,
      price: wethPrice.times(wethPerToken),
    })
  })
  return prices
}

const getPrice = async (
  tokenAddress: string,
  networkId = 1,
): Promise<BigNumber> => {
  const data: any = await getPriceHistory(tokenAddress, networkId)
  return data.tokens[0] && new BigNumber(data.tokens[0].dayData[0].priceUSD)
}

const getPollyBurned = async (): Promise<any> => {
  const data: any = await _querySubgraph(_getPollyBurnQuery(), 'pollyBurn', 137)
  return data.burn
}

const getPollySupply = async (): Promise<number> => {
  const data: any = await _querySubgraph(
    _getPollySupplyQuery(),
    'pollyBurn',
    137,
  )
  return data.tokenStats.supply
}

const getMarketInfo = async (tokenAddress: string): Promise<any> =>
  await _querySubgraph(
    _getMarketQuery(tokenAddress),
    'baoMarkets',
    Config.networkId,
  )

const getMarketsInfo = async (): Promise<any> =>
  await _querySubgraph(_getMarketsQuery(), 'baoMarkets', Config.networkId)

const _getPriceHistoryQuery = (tokenAddress: string) =>
  `
  {
    tokens(where: {id:"${tokenAddress}"}) {
      id
      symbol
      name
      dayData(orderBy:date, orderDirection:desc) {
        date
        priceUSD
      }
    }
  }
  `

const _getPriceHistoryQueryMultiple = (tokenAddresses: string[], first = 100) =>
  `
  {
    tokens(where: {id_in:["${tokenAddresses
      .map((symbol) => symbol.toLowerCase())
      .join('","')}"]}) {
      id
      name
      symbol
      decimals
      dayData(orderBy:date, orderDirection:desc, first: ${first}) {
        date
        priceUSD
      }
    }
  }
  `

const _getPriceFromPair = (tokenAddress: string) =>
  `
  {
    token(id:"${tokenAddress}"){
      ${['basePairs', 'quotePairs'].map(
        (prefix) => `
          ${prefix} {
            token0 {
              symbol
            },
            token1 {
              symbol
            }
            token0Price,
            token1Price
          }
          `,
      )}
    }
  }
  `

const _getPriceFromPairMultiple = (tokenAddresses: string[]) => {
  return `
  {
    tokens(where: {id_in:[${tokenAddresses
      .map((address) => `"${address}"`)
      .join(',')}]}){
      id,
      ${['basePairs', 'quotePairs'].map(
        (prefix) => `
          ${prefix} {
            token0 {
              symbol
            },
            token1 {
              symbol
            }
            token0Price,
            token1Price
          }
          `,
      )}
    }
  }
  `
}

const _getPollyBurnQuery = () =>
  `
  {
    burn(id:"0"){
      burnedTokens,
      eventCount,
    }
  }
  `

const _getPollySupplyQuery = () =>
  `
  {
    tokenStats(id:"0"){
      supply
    }
  }
  `

const _getMarketQuery = (tokenAddress: string) =>
  `
  {
    market(id:"${tokenAddress.toLowerCase()}"){
      cash,
      symbol,
      collateralFactor,
      exchangeRate,
      interestRateModelAddress,
      borrowRate,
      supplyRate,
      numberOfBorrowers,
      numberOfSuppliers,
      totalBorrows,
      totalSupply,
      reserves,
      underlyingSymbol,
      accrualBlockNumber,
      reserveFactor,
      underlyingPriceUSD,
      underlyingDecimals
    }
  }
  `

const _getMarketsQuery = () =>
  `
  {
    markets {
      cash,
      symbol,
      collateralFactor,
      exchangeRate,
      interestRateModelAddress,
      borrowRate,
      supplyRate,
      numberOfBorrowers,
      numberOfSuppliers,
      totalBorrows,
      totalSupply,
      reserves,
      underlyingSymbol,
      accrualBlockNumber,
      reserveFactor,
      underlyingPriceUSD,
      underlyingDecimals
    }
  }
  `

export default {
  getPriceHistory,
  getPriceHistoryMultiple,
  getPriceFromPair,
  getPriceFromPairMultiple,
  getPrice,
  getPollyBurned,
  getPollySupply,
  getMarketInfo,
  getMarketsInfo,
}
