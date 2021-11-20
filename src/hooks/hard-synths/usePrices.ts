import fetcher from "bao/lib/fetcher"
import { SWR } from "bao/lib/types"
import useSWR from "swr"
import Config from '../../bao/lib/config'

type Prices = {
  prices: {
    [key: string]: {
      usd: number
    }
  }
}

export const usePrice = (coingeckoId: string): Prices => {
  const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
  const { data, error } = useSWR((url), fetcher)

  return {
    prices: data || {},
  }
}

export const usePrices = (): SWR & Prices => {
  const coingeckoIds = Object.values(Config.markets).map(({ coingeckoId }) => coingeckoId)
  const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoIds.join(',')}`
  const { data, error } = useSWR((url), fetcher)

  return {
    prices: data || {},
    isLoading: !error && !data,
    isError: error,
  }
}