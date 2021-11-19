import {useCallback, useEffect, useState} from 'react'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { provider } from 'web3-core'
import Config from '../../bao/lib/config'
import MultiCall from '../../utils/multicall'
import { decimate } from '../../utils/numberFormat'

type AccountLiquidity = {
    netApy: number
    usdSupply: number
    usdBorrow: number
    usdBorrowable: number
  }

export const useAccountLiquidity = () => {
    const bao = useBao()
    const { account }: { account: string; ethereum: provider } = useWallet()
  
}