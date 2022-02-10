import { getBaoSupply, getMasterChefContract, getReferrals } from 'bao/utils'
import BigNumber from 'bignumber.js'
import Card from 'components/Card'
import CardContent from 'components/CardContent'
import ExternalLink from 'components/ExternalLink'
import { SpinnerLoader } from 'components/Loader'
import Spacer from 'components/Spacer'
import useAllEarnings from 'hooks/farms/useAllEarnings'
import useAllStakedValue from 'hooks/farms/useAllStakedValue'
import useBao from 'hooks/base/useBao'
import useFarms from 'hooks/farms/useFarms'
import useLockedEarnings from 'hooks/farms/useLockedEarnings'
import useTokenBalance from 'hooks/base/useTokenBalance'
import React, { Fragment, useEffect, useState } from 'react'
import { Badge, Col, Row } from 'react-bootstrap'
import CountUp from 'react-countup'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { getBalanceNumber, getDisplayBalance } from 'utils/numberFormat'
import { Footnote, FootnoteValue, StyledInfo } from './styles'

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
		<span>
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
	const [totalReferrals, setTotalReferrals] = useState<string>()
	const [refLink, setRefLink] = useState<string>()
	const bao = useBao()
	const baoBalance = useTokenBalance(
		bao && bao.getContract('bao').options.address,
	)
	const masterChefContract = getMasterChefContract(bao)
	const { account, ethereum }: { account: any; ethereum: any } = useWallet()
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const locks = useLockedEarnings()

	useEffect(() => {
		async function fetchTotalSupply() {
			const supply = await getBaoSupply(bao)
			setTotalSupply(supply)
		}
		if (bao) {
			fetchTotalSupply()
		}
	}, [bao, setTotalSupply])

	useEffect(() => {
		async function fetchTotalReferrals() {
			const referrals = await getReferrals(masterChefContract, account)
			setTotalReferrals(referrals)
		}
		if (bao) {
			fetchTotalReferrals()
		}
	}, [bao, setTotalReferrals])

	useEffect(() => {
		async function fetchRefLink() {
			const usrReflink = 'www.baofinance.com?ref=' + account
			setRefLink(usrReflink)
		}
		if (bao) {
			fetchRefLink()
		}
	}, [bao, setRefLink])

	return (
		<Fragment>
				<Row style={{ display: 'flex', flexWrap: 'wrap' }}>
					<Col style={{ display: 'flex', flexDirection: 'column' }}>
						<Card>
							<CardContent>
								<StyledInfo>
									❗️{' '}
									<span
										style={{
											fontWeight: 700,
											color: '${(props) => props.theme.color.red}',
										}}
									>
										Attention:
									</span>{' '}
									Be sure to read the{' '}
									<ExternalLink
										href="https://docs.bao.finance/franchises/bao"
										target="_blank"
									>
										docs
									</ExternalLink>{' '}
									before using the farms so you are familiar with protocol risks
									and fees!
								</StyledInfo>
								<Spacer size="md" />
								<StyledInfo>
									❓{' '}
									<span
										style={{
											fontWeight: 700,
											color: '${(props) => props.theme.color.red}',
										}}
									>
										Don't see your farm?
									</span>{' '}
									Visit{' '}
									<ExternalLink href="https://old.bao.finance" target="_blank">
										old.bao.finance
									</ExternalLink>{' '}
									to withdraw your LP from our archived farms.
								</StyledInfo>
							</CardContent>
						</Card>
					</Col>
					<Col style={{ display: 'flex', flexDirection: 'column' }}>
						<Card>
							<Footnote>
								Your BAO Balance
								<FootnoteValue>
									{account ? getBalanceNumber(baoBalance).toFixed(2) : 'Locked'}{' '}
								</FootnoteValue>
							</Footnote>
							<Footnote>
								Your Locked BAO
								<FootnoteValue>
									{getBalanceNumber(locks).toFixed(2)}
								</FootnoteValue>
							</Footnote>
							<Footnote>
								Pending harvest
								<FootnoteValue>
									<PendingRewards />
								</FootnoteValue>
							</Footnote>
							<Footnote>
								Total BAO Supply
								<FootnoteValue>
									{totalSupply
										? getBalanceNumber(totalSupply).toFixed(2)
										: 'Locked'}
								</FootnoteValue>
							</Footnote>
							<Footnote>
								BAO Price
								<FootnoteValue>
									{baoPrice ? (
										`$${getDisplayBalance(baoPrice, 0)}`
									) : (
										<SpinnerLoader />
									)}
								</FootnoteValue>
							</Footnote>
						</Card>
					</Col>
				</Row>
		</Fragment>
	)
}

export default Balances

const BaoPrice = styled.div`
	margin: 0 auto;
	text-align: center;
`
