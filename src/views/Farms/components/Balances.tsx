import { useWeb3React } from '@web3-react/core'
import { getBaoSupply } from 'bao/utils'
import BigNumber from 'bignumber.js'
import { SpinnerLoader } from 'components/Loader'
import {
	UserStatsContainer,
	UserStatsWrapper,
	StatWrapper,
	UserStat,
} from 'components/Stats'
import useBao from 'hooks/base/useBao'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useAllEarnings from 'hooks/farms/useAllEarnings'
import useAllStakedValue from 'hooks/farms/useAllStakedValue'
import useFarms from 'hooks/farms/useFarms'
import useLockedEarnings from 'hooks/farms/useLockedEarnings'
import React, { Fragment, useEffect, useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import CountUp from 'react-countup'
import { getBalanceNumber, getDisplayBalance, truncateNumber } from 'utils/numberFormat'

const PendingRewards: React.FC = () => {
	const [start, setStart] = useState(0)
	const [end, setEnd] = useState(0)
	const [scale, setScale] = useState(1)

	const allEarnings = useAllEarnings()
	let sumEarning = 0
	for (const earning of allEarnings) {
		sumEarning += new BigNumber(earning)
			.div(new BigNumber(10).pow(18))
			.toNumber()
	}

	const [farms] = useFarms()
	const allStakedValue = useAllStakedValue()

	if (allStakedValue && allStakedValue.length) {
		const sumWeth = farms.reduce(
			(c, { id }, i) => c + (allStakedValue[i].totalWethValue.toNumber() || 0),
			0,
		)
	}

	useEffect(() => {
		setStart(end)
		setEnd(sumEarning)
	}, [sumEarning])

	return (
		<span
			style={{
				transform: `scale(${scale})`,
				transformOrigin: 'right bottom',
				transition: 'transform 0.5s',
				display: 'inline-block',
			}}
		>
			<CountUp
				start={start}
				end={end}
				decimals={end < 0 ? 4 : end > 1e5 ? 0 : 2}
				duration={1}
				onStart={() => {
					setScale(1.25)
					setTimeout(() => setScale(1), 600)
				}}
				separator=","
			/>
		</span>
	)
}

const Balances: React.FC = () => {
	const [totalSupply, setTotalSupply] = useState<BigNumber>()
	const bao = useBao()
	const baoBalance = useTokenBalance(
		bao && bao.getContract('bao').options.address,
	)
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
		fetch(
			'https://api.coingecko.com/api/v3/simple/price?ids=bao-finance&vs_currencies=usd',
		).then(async (res) => {
			setBaoPrice(new BigNumber((await res.json())['bao-finance'].usd))
		})
	}, [bao, setBaoPrice])

	return (
		<Fragment>
				<Row style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem' }}>
					<UserStatsContainer>
						<UserStatsWrapper>
							<StatWrapper>
								<UserStat>
									<h1>BAO Balance</h1>
									<p>
									{account ? (
										window.screen.width > 1200 ? (
											getDisplayBalance(baoBalance)
										) : (
											truncateNumber(baoBalance)
										)
									) : (
									'-'
									)}
									</p>
								</UserStat>
							</StatWrapper>
							<StatWrapper>
								<UserStat>
									<h1>Locked BAO</h1>
									<p>
									{account ? (
										window.screen.width > 1200 ? (
											getDisplayBalance(locks)
										) : (
											truncateNumber(locks)
										)
									) : (
									'-'
									)}
									</p>
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
									{baoPrice ? (
										`$${getDisplayBalance(baoPrice, 0)}`
									) : (
										<SpinnerLoader />
									)}
								</UserStat>
							</StatWrapper>
						</UserStatsWrapper>
					</UserStatsContainer>
				</Row>
		</Fragment>
	)
}

export default Balances
