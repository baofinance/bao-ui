import { useWeb3React } from '@web3-react/core'
import { getBaoSupply } from 'bao/utils'
import BigNumber from 'bignumber.js'
import { SpinnerLoader } from 'components/Loader'
import { StatWrapper, UserStat, UserStatsContainer, UserStatsWrapper } from 'components/Stats'
import useBao from 'hooks/base/useBao'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useAllEarnings from 'hooks/farms/useAllEarnings'
import useLockedEarnings from 'hooks/farms/useLockedEarnings'
import React, { Fragment, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { getDisplayBalance, truncateNumber } from 'utils/numberFormat'

const PendingRewards: React.FC = () => {
	const allEarnings = useAllEarnings()
	let sumEarning = 0
	for (const earning of allEarnings) {
		sumEarning += new BigNumber(earning).div(new BigNumber(10).pow(18)).toNumber()
	}

	return <span>{getDisplayBalance(sumEarning, 0)}</span>
}

const Balances: React.FC = () => {
	const [totalSupply, setTotalSupply] = useState<BigNumber>()
	const bao = useBao()
	const baoBalance = useTokenBalance(bao && bao.getContract('bao').options.address)
	const { account } = useWeb3React()
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const locks = useLockedEarnings()

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
			setBaoPrice(new BigNumber((await res.json())['bao-finance'].usd))
		})
	}, [bao, setBaoPrice])

	return (
		<>
			<Row style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem' }}>
				<UserStatsContainer>
					<UserStatsWrapper>
						<StatWrapper>
							<UserStat>
								<h1>BAO Balance</h1>
								<p>{account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}</p>
							</UserStat>
						</StatWrapper>
						<StatWrapper>
							<UserStat>
								<h1>Locked BAO</h1>
								<p>{account ? (window.screen.width > 1200 ? getDisplayBalance(locks) : truncateNumber(locks)) : '-'}</p>
							</UserStat>
						</StatWrapper>
						<StatWrapper>
							<UserStat>
								<h1>Pending Harvest</h1>
								<p>{account ? <PendingRewards /> : '-'}</p>
							</UserStat>
						</StatWrapper>
						<StatWrapper>
							<UserStat>
								<h1>Total BAO Supply</h1>
								{totalSupply ? (
									window.screen.width > 1200 ? (
										getDisplayBalance(totalSupply)
									) : (
										truncateNumber(totalSupply)
									)
								) : (
									<SpinnerLoader />
								)}
							</UserStat>
						</StatWrapper>
						<StatWrapper>
							<UserStat>
								<h1>BAO Price</h1>
								{baoPrice ? `$${getDisplayBalance(baoPrice, 0)}` : <SpinnerLoader />}
							</UserStat>
						</StatWrapper>
					</UserStatsWrapper>
				</UserStatsContainer>
			</Row>
		</>
	)
}

export default Balances
