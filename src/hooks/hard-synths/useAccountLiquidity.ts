import {useCallback, useEffect, useState} from 'react'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { provider } from 'web3-core'
import Config from '../../bao/lib/config'
import MultiCall from '../../utils/multicall'
import { decimate } from '../../utils/numberFormat'
import { getAccountLiquidity, getComptrollerContract } from 'bao/utils'
import { useExchangeRates } from './useExchangeRates'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import useMarkets from './useMarkets'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

type AccountLiquidity = {
    netApy: number
    usdSupply: number
    usdBorrow: number
    usdBorrowable: number
  }

// export const useAccountLiquidity = (): AccountLiquidity[] => {
//     const bao = useBao()
//     const { account }: { account: string; ethereum: provider } = useWallet()
//     const markets = useMarkets()
//     const { prices: oraclePrices } = useAnchorPrices()
//     const supplyBalances = useSupplyBalances()
//     const borrowBalances = useBorrowBalances()
//     const exchangeRates = useExchangeRates()
//     const [ accountLiquidity, setAccountLiquidity ] = useState<AccountLiquidity[] | undefined>()

//     const fetchAccountLiquidity = useCallback(async () => {
//       const _accountLiquidity = await getAccountLiquidity(
//         getComptrollerContract(bao),
//         account,
//       )
//       setAccountLiquidity(_accountLiquidity)
//     }, [bao, account])
  
//     useEffect(() => {
//       fetchAccountLiquidity()
//     }, [bao, account])
   
//     if (
//       !account ||
//       !accountLiquidity ||
//       !oraclePrices ||
//       !supplyBalances ||
//       !borrowBalances ||
//       !exchangeRates
//     ) {
//       return {
//         netApy: 0,
//         usdSupply: 0,
//         usdBorrow: 0,
//         usdBorrowable: 0,
//       }
//     }

//     const decimals = Config.markets.map((market) => market.decimals)

//     let prices = {}
//     for (var key in oraclePrices) {
//       if (oraclePrices.hasOwnProperty(key)) {
//           prices[key] = parseFloat(formatUnits(oraclePrices[key], BigNumber.from(36).sub(decimals[key])))
//       }
//     }
//     // const prices = oraclePrices
//     // .map((v,i) => parseFloat(formatUnits(v, BigNumber.from(36).sub(UNDERLYING[addresses[i]].decimals))))
//     // .reduce((p,v,i) => ({...p, [addresses[i]]:v}), {})
    
//     const usdSupply = Object.entries(supplyBalances).reduce((prev, [address, balance]) => {
//       const underlying = Config.markets.map((market) => market.underlyingAddresses[Config.networkId])
//       return (
//         prev +
//         parseFloat(formatUnits(balance, underlying.decimals)) *
//           parseFloat(formatUnits(exchangeRates[address])) *
//           prices[address]
//       )
//     }, 0)
  
//     const usdBorrow = Object.entries(borrowBalances).reduce((prev, [address, balance]) => {
//       const underlying = UNDERLYING[address]
//       return prev + parseFloat(formatUnits(balance, underlying.decimals)) * prices[address]
//     }, 0)
  
//     const supplyApy = markets.reduce(
//       (prev: number, { token, underlying, supplyApy }: Market) =>
//         prev +
//         (supplyBalances[token]
//           ? parseFloat(formatUnits(supplyBalances[token], underlying.decimals)) *
//             parseFloat(formatUnits(exchangeRates[token])) *
//             prices[token] *
//             (supplyApy || 1)
//           : 0),
//       0
//     )
  
//     const borrowApy = markets.reduce(
//       (prev: number, { token, underlying, supplyApy }: Market) =>
//         prev +
//         (borrowBalances[token]
//           ? parseFloat(formatUnits(borrowBalances[token], underlying.decimals)) *
//             prices[token] *
//             (supplyApy || 1)
//           : 0),
//       0
//     )
  
//     const netApy =
//       supplyApy > borrowApy
//         ? (supplyApy - borrowApy) / usdSupply
//         : borrowApy > supplyApy
//         ? (supplyApy - borrowApy) / usdBorrow
//         : 0
  
//     return {
//       netApy,
//       usdSupply,
//       usdBorrow,
//       usdBorrowable: parseFloat(formatUnits(data[1])),
//       isLoading: !error && !data,
//       isError: error,
//     }
//   }

// function useAnchorPrices(): { prices: any; isLoading: any } {
//   throw new Error('Function not implemented.')
// }
  