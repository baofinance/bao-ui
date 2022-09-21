import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import { BigNumber } from 'ethers'

import { getBaoSupply } from '@/bao/utils'
import Loader from '@/components/Loader'
import { StatCards } from '@/components/Stats'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useAllEarnings from '@/hooks/farms/useAllEarnings'
import useLockedEarnings from '@/hooks/farms/useLockedEarnings'
import { getDisplayBalance, truncateNumber } from '@/utils/numberFormat'

const Balances: React.FC = () => {
	const [totalSupply, setTotalSupply] = useState<BigNumber>()
	const bao = useBao()
	const baoBalance = useTokenBalance(bao && bao.getContract('bao').address)
	const { account } = useWeb3React()
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const locks = useLockedEarnings()
	const allEarnings = useAllEarnings()

	// FIXME: this should do math with an ethers.BigNumber, not a javascript number.
	let sumEarning = BigNumber.from(0)
	for (const earning of allEarnings) {
		sumEarning = sumEarning.add(BigNumber.from(earning).div(BigNumber.from(10).pow(18)))
	}
 
	const stats = [
		{
			label: 'BAO Balance',
			value: `${account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}`,
		},
		{ label: 'Locked BAO', value: `${account ? (window.screen.width > 1200 ? getDisplayBalance(locks) : truncateNumber(locks)) : '-'}` },
		{ label: 'Pending Harvest', value: `${account ? getDisplayBalance(sumEarning, 0) : '-'}` },
		{
			// FIXME: the total supply is never retrieved from the contract
			label: 'Total BAO Supply',
			value: `${totalSupply ? window.screen.width > 1200 ? getDisplayBalance(totalSupply) : truncateNumber(totalSupply) : <Loader />}`,
		},
		{ label: 'BAO Price', value: `${baoPrice ? `$${getDisplayBalance(baoPrice, 0)}` : <Loader />}` },
	]

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await getBaoSupply(bao)
			setTotalSupply(supply)
		}

		if (bao) fetchTotalSupply()
	}, [bao, setTotalSupply])

	useEffect(() => {
		if (!bao) return
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=bao-finance&vs_currencies=usd').then(async res => {
			setBaoPrice((await res.json())['bao-finance'].usd)
		})
	}, [bao, setBaoPrice])

	return (
		<>
			<div className={`mx-auto my-4 ${isDesktop ? 'flex-flow flex gap-4' : 'flex flex-col gap-3'} justify-evenly`}>
				<StatCards stats={stats} />
			</div>
		</>
	)
}

export default Balances
