import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ParentSize } from '@visx/responsive'
import BigNumber from 'bignumber.js'
import { Button } from 'components/Button'
import AreaGraph from 'components/Graphs/AreaGraph/AreaGraph'
import DonutGraph from 'components/Graphs/PieGraph'
import { SpinnerLoader } from 'components/Loader'
import Spacer from 'components/Spacer'
import Table from 'components/Table'
import Tooltipped from 'components/Tooltipped'
import { BasketComponent } from 'contexts/Baskets/types'
import useBao from 'hooks/useBao'
import useComposition from 'hooks/useComposition'
import useGraphPriceHistory from 'hooks/useGraphPriceHistory'
import useModal from 'hooks/useModal'
import useNav from 'hooks/useNav'
import useBasket from 'hooks/useBasket'
import useBasketRate from 'hooks/useBasketRate'
import usePairPrice from 'hooks/usePairPrice'
import useTokenBalance from 'hooks/useTokenBalance'
import _ from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Button as BootButton, Col, Row } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { getContract } from 'utils/erc20'
import { decimate, getDisplayBalance } from 'utils/numberFormat'
import { HeaderWrapper, ItemWrapper } from 'views/Markets/components/styles'
import { provider } from 'web3-core'
import Config from '../../bao/lib/config'
import NDEFI from './components/explanations/nDEFI'
import NSTBL from './components/explanations/nSTBL'
import IssueModal from './components/IssueModal'
import NavModal from './components/NavModal'
import { Progress } from './components/Progress'
import RedeemModal from './components/RedeemModal'
import {
	CornerButtons,
	GraphContainer,
	Icon,
	BasketAnalytics,
	BasketAnalyticsContainer,
	BasketBox,
	BasketBoxBreak,
	BasketBoxHeader,
	BasketButtons,
	BasketCornerButton,
	BasketExplanation,
	PieGraphRow,
	PrefButtons,
	PriceBadge,
	PriceGraph,
	QuestionIcon,
	StatCard,
	StatHeader,
	StatsRow,
	StyledBadge
} from './components/styles'

const Basket: React.FC = () => {
	const { basketId }: any = useParams()

	const [supply, setSupply] = useState<BigNumber | undefined>()
	const [analyticsOpen, setAnalyticsOpen] = useState(true)
	const [priceHistoryTimeFrame, setPriceHistoryTimeFrame] = useState('M')
	const [allocationDisplayType, setAllocationDisplayType] = useState(false)

	const basket = useBasket(basketId)
	const { nid, basketToken, basketTokenAddress, inputTokenAddress, icon } = basket

	const composition = useComposition(basket)
	const { wethPrice } = useBasketRate(basketTokenAddress)
	const priceHistory = useGraphPriceHistory(basket)
	const nav = useNav(composition, supply)
	const sushiPairPrice = usePairPrice(basket)

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const { ethereum } = useWallet()

	const basketContract = useMemo(() => {
		return getContract(ethereum as provider, basketTokenAddress)
	}, [ethereum, basketTokenAddress])

	const inputTokenContract = useMemo(() => {
		return getContract(ethereum as provider, inputTokenAddress)
	}, [ethereum, inputTokenAddress])

	const outputTokenContract = useMemo(() => {
		return getContract(ethereum as provider, basketTokenAddress)
	}, [ethereum, basketTokenAddress])

	const maxAllocationPercentage = useMemo(() => {
		return (
			composition &&
			_.max(
				_.map(composition, (component) =>
					parseFloat(component.percentage.toString()),
				),
			)
		)
	}, [composition])

	const basketPriceChange24h = useMemo(() => {
		return (
			priceHistory &&
			new BigNumber(priceHistory[priceHistory.length - 1].close)
				.minus(priceHistory[priceHistory.length - 2].close)
				.div(priceHistory[priceHistory.length - 1].close)
				.times(100)
		)
	}, [priceHistory])

	const marketCap = useMemo(() => {
		return (
			supply &&
			sushiPairPrice &&
			`$${getDisplayBalance(decimate(supply).times(sushiPairPrice), 0)}`
		)
	}, [supply, sushiPairPrice])

	const tokenBalance = useTokenBalance(basketContract.options.address)
	const bao = useBao()

	const _inputToken = inputTokenContract.options.address
	const _outputToken = outputTokenContract.options.address

	const [onNavModal] = useModal(<NavModal />)

	const [onPresentDeposit] = useModal(
		<IssueModal
			basketName={basketToken}
			basketAddress={basketTokenAddress}
			inputTokenName="WETH"
			_inputToken={_inputToken}
			_outputToken={_outputToken}
			basketContract={basketContract}
			inputTokenContract={inputTokenContract}
			outputTokenContract={outputTokenContract}
			nav={nav}
		/>,
	)

	const [onPresentRedeem] = useModal(
		<RedeemModal
			max={tokenBalance}
			basketName={basketToken}
			basketContract={basketContract}
			nid={nid}
		/>,
	)

	useEffect(() => {
		if (basketContract.options.address)
			basketContract.methods
				.totalSupply()
				.call()
				.then((_supply: any) => setSupply(new BigNumber(_supply)))
	}, [bao, ethereum])

	const allocationBreakdown = [
		{
			header: <HeaderWrapper style={{ justifyContent: 'start', textAlign: 'start', width: '10%' }}>Asset</HeaderWrapper>,
			value: (component: BasketComponent) => {
				return (
					<ItemWrapper style={{ justifyContent: 'start', textAlign: 'start', width: '10%' }}>
						<img src={component.imageUrl} />
						<p>{component.symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center', width: '70%' }}>Allocation</HeaderWrapper>,
			value: (component: BasketComponent) => (
				<ItemWrapper style={{ justifyContent: 'start', width: '70%' }}>
					<Progress
						width={
							(component.percentage / maxAllocationPercentage) *
							100
						}
						label={`${getDisplayBalance(
							new BigNumber(component.percentage),
							0,
						)}%`}
						assetColor={component.color}
					/>
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center', width: '10%' }}>Price</HeaderWrapper>,
			value: (component: BasketComponent) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center', width: '10%' }}>
					$
					{getDisplayBalance(
						component.basePrice || component.price,
						0,
					)}
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center', width: '10%' }}>Strategy</HeaderWrapper>,
			value: (component: BasketComponent) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center', width: '10%' }}>
					<StyledBadge>{component.strategy}</StyledBadge>
				</ItemWrapper>
			),
		},
	]

	return (
		<>
			<BasketBox>
				<CornerButtons>
					<Tooltipped content={`${analyticsOpen ? 'Hide' : 'View'} Analytics`}>
						<BasketCornerButton
							onClick={() => setAnalyticsOpen(!analyticsOpen)}
							aria-controls="analytics-collapse"
							aria-expanded={analyticsOpen}
						>
							<FontAwesomeIcon icon="chart-line" />
						</BasketCornerButton>
					</Tooltipped>
					<Tooltipped content="View Contract">
						<BasketCornerButton
							href={`https://polygonscan.com/address/${basketTokenAddress}`}
							target="_blank"
						>
							<FontAwesomeIcon icon="file-contract" />
						</BasketCornerButton>
					</Tooltipped>
				</CornerButtons>
				<BasketBoxHeader>
					<Icon src={icon} alt={basketToken} />
					{/* <br />
					<PriceBadge>
						1 {basketToken} ={' '}
						{(wethPrice &&
							sushiPairPrice &&
							getDisplayBalance(sushiPairPrice.div(wethPrice), 0)) || (
								<SpinnerLoader />
							)}{' '}
						<FontAwesomeIcon icon={['fab', 'ethereum']} /> = $
						{(sushiPairPrice && getDisplayBalance(sushiPairPrice, 0)) || (
							<SpinnerLoader />
						)}
					</PriceBadge>
					<br /> */}
				</BasketBoxHeader>
				<StatsRow lg={4} sm={2}>
					<Col>
						<StatCard>
							<StatHeader>
								<FontAwesomeIcon icon="hand-holding-usd" />
								<br />
								Market Cap
							</StatHeader>
							<Spacer size={'sm'} />
							<StyledBadge>{marketCap || <SpinnerLoader />}</StyledBadge>
						</StatCard>
					</Col>
					<Col>
						<StatCard>
							<StatHeader>
								<FontAwesomeIcon icon="coins" />
								<br />
								Supply
							</StatHeader>
							<Spacer size={'sm'} />
							<StyledBadge>
								{(supply && `${getDisplayBalance(supply)} ${basketToken}`) || (
									<SpinnerLoader />
								)}
							</StyledBadge>
						</StatCard>
					</Col>
					<Col>
						<StatCard>
							<StatHeader>
								<FontAwesomeIcon icon="money-bill-wave" />
								<br />
								NAV &nbsp;
								<QuestionIcon icon="question-circle" onClick={onNavModal} />
							</StatHeader>
							<Spacer size={'sm'} />
							<StyledBadge>
								{(nav && `$${getDisplayBalance(nav.mainnetNav, 0)}`) || (
									<SpinnerLoader />
								)}
							</StyledBadge>
						</StatCard>
					</Col>
					<Col>
						<StatCard>
							<StatHeader>
								<FontAwesomeIcon icon="angle-double-up" />
								<FontAwesomeIcon icon="angle-double-down" />
								<br />
								Premium{' '}
								{sushiPairPrice && (
									<Tooltipped
										content={`Difference between ${basketToken} price on SushiSwap ($${getDisplayBalance(
											sushiPairPrice,
											0,
										)}) and NAV price.`}
									/>
								)}
							</StatHeader>
							<Spacer size={'sm'} />
							<StyledBadge>
								{(nav &&
									sushiPairPrice &&
									`${getDisplayBalance(
										sushiPairPrice
											.minus(nav.nav)
											.div(sushiPairPrice)
											.times(100),
										0,
									)}%`) || <SpinnerLoader />}
							</StyledBadge>
						</StatCard>
					</Col>
				</StatsRow>
				<BasketButtons>
					<Button
						text="Issue"
						onClick={onPresentDeposit}
						width="20%"
						disabled={!nav}
					/>
					<Spacer />
					<Button
						disabled={tokenBalance.eq(new BigNumber(0))}
						text="Redeem"
						onClick={onPresentRedeem}
						width="20%"
					/>
					<Spacer />
					<Button
						href={`https://app.sushi.com/swap?inputCurrency=${basketTokenAddress}&outputCurrency=${Config.addressMap.WETH}`}
						target="_blank"
						text="Swap"
						width="20%"
					/>
				</BasketButtons>
				<BasketAnalytics in={analyticsOpen}>
					<BasketAnalyticsContainer>
						<BasketBoxBreak />
						{priceHistory && priceHistory[priceHistory.length - 1].close > 0 && (
							<PriceGraph>
								<BasketBoxHeader style={{ float: 'left' }}>
									Basket Price
								</BasketBoxHeader>
								<PrefButtons>
									{_.map(['W', 'M', 'Y'], (timeFrame) => (
										<BootButton
											variant="outline-primary"
											onClick={() => setPriceHistoryTimeFrame(timeFrame)}
											active={priceHistoryTimeFrame === timeFrame}
											key={timeFrame}
											style={{ marginTop: '0px', borderColor: 'transparent' }}
										>
											{timeFrame}
										</BootButton>
									))}
								</PrefButtons>
								<BasketBoxHeader style={{ float: 'right' }}>
									{basketPriceChange24h ? (
										<>
											$
											{priceHistory &&
												getDisplayBalance(
													new BigNumber(
														priceHistory[priceHistory.length - 1].close,
													),
													0,
												)}
											<span
												className="smalltext"
												style={{
													color: basketPriceChange24h.gt(0) ? 'green' : 'red',
												}}
											>
												{priceHistory &&
													getDisplayBalance(basketPriceChange24h, 0)}
												{'%'}
											</span>
										</>
									) : (
										<SpinnerLoader />
									)}
								</BasketBoxHeader>
								<GraphContainer style={{ paddingTop: '4rem' }}>
									<ParentSize>
										{(parent) =>
											priceHistory && (
												<AreaGraph
													width={parent.width}
													height={parent.height}
													timeseries={priceHistory}
													timeframe={priceHistoryTimeFrame}
												/>
											)
										}
									</ParentSize>
								</GraphContainer>
							</PriceGraph>
						)}
						<BasketBoxHeader style={{ float: 'left' }}>
							Allocation Breakdown
						</BasketBoxHeader>
						<PrefButtons>
							<BootButton
								variant="outline-primary"
								onClick={() => setAllocationDisplayType(false)}
								active={!allocationDisplayType}
								style={{ marginTop: '0px', borderColor: 'transparent' }}
							>
								<FontAwesomeIcon icon="table" />
							</BootButton>
							<BootButton
								variant="outline-primary"
								onClick={() => setAllocationDisplayType(true)}
								active={allocationDisplayType}
								style={{ marginTop: '0px', borderColor: 'transparent' }}
							>
								<FontAwesomeIcon icon="chart-pie" />
							</BootButton>
						</PrefButtons>
						<br />
						{!allocationDisplayType ? (
							<Table columns={allocationBreakdown} items={composition} />
						) : (
							<GraphContainer style={{ height: 'auto' }}>
								<PieGraphRow lg={2}>
									<Col lg={8}>
										{composition && (
											<ParentSize>
												{(parent) => (
													<DonutGraph
														width={parent.width}
														height={parent.height}
														composition={composition}
													/>
												)}
											</ParentSize>
										)}
									</Col>
									<Col lg={4} style={{ margin: 'auto' }}>
										<Row lg={2}>
											{composition &&
												composition.map((component) => (
													<Col key={component.symbol}>
														<Badge
															style={{
																backgroundColor: component.color,
																margin: '8px 0',
															}}
														>
															{component.symbol}
														</Badge>
													</Col>
												))}
										</Row>
									</Col>
								</PieGraphRow>
							</GraphContainer>
						)}
					</BasketAnalyticsContainer>
				</BasketAnalytics>
				<Spacer size="lg" />
				<BasketExplanation>
					{/* TODO: Store pointer to basket description in config, this is messy */}
					{basketTokenAddress === Config.addressMap.nDEFI && <NDEFI />}
					{basketTokenAddress === Config.addressMap.nSTBL && <NSTBL />}
				</BasketExplanation>
			</BasketBox>
		</>
	)
}

export default Basket
