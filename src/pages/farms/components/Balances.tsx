import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import { BigNumber } from 'ethers'
import BN from 'bignumber.js'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import Config from '@/bao/lib/config'
import Loader from '@/components/Loader'
import { StatCards } from '@/components/Stats'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useAllEarnings from '@/hooks/farms/useAllEarnings'
import useLockedEarnings from '@/hooks/farms/useLockedEarnings'
import { getDisplayBalance, truncateNumber, decimate, exponentiate } from '@/utils/numberFormat'
import useContract from '@/hooks/base/useContract'
import { Bao } from '@/typechain/index'

const Balances: React.FC = () => {
	const [totalSupply, setTotalSupply] = useState<BigNumber>()
	const baoBalance = useTokenBalance(Config.addressMap.BAO)
	const { account } = useWeb3React()
	const [baoPrice, setBaoPrice] = useState<BigNumber>(BigNumber.from(0))
	const locks = useLockedEarnings()
	const allEarnings = useAllEarnings()

	const baoContract = useContract<Bao>('Bao')

	let sumEarning = BigNumber.from(0)
	for (const earning of allEarnings) {
		sumEarning = sumEarning.add(BigNumber.from(earning))
	}

	const stats = [
		{
			label: 'BAO Balance',
			value: `${account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}`,
		},
		{ label: 'Locked BAO', value: `${account ? (window.screen.width > 1200 ? getDisplayBalance(locks) : truncateNumber(locks)) : '-'}` },
		{ label: 'Pending Harvest', value: `${account ? getDisplayBalance(sumEarning) : '-'}` },
		{
			// FIXME: the total supply is never retrieved from the contract
			label: 'Total BAO Supply',
			value: `${totalSupply ? window.screen.width > 1200 ? getDisplayBalance(totalSupply) : truncateNumber(totalSupply) : <Loader />}`,
		},
		{ label: 'BAO Price', value: `${baoPrice ? `$${getDisplayBalance(baoPrice, 18, 8)}` : <Loader />}` },
	]

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await baoContract.totalSupply()
			setTotalSupply(supply)
		}

		if (baoContract) fetchTotalSupply()
	}, [baoContract])

	useEffect(() => {
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=bao-finance&vs_currencies=usd').then(async res => {
			const _baoPrice = parseUnits(new BN((await res.json())['bao-finance'].usd).toFixed(18))
			setBaoPrice(_baoPrice)
		})
	}, [setBaoPrice])

	return (
		<>
			<div className={`mx-auto my-4 ${isDesktop ? 'flex-flow flex gap-4' : 'flex flex-col gap-3'} justify-evenly`}>
				<StatCards stats={stats} />
			</div>
		</>
	)
}

export default Balances
