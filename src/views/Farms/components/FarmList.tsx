import { getEarned, getMasterChefContract } from 'bao/utils'
import BigNumber from 'bignumber.js'
import { SpinnerLoader } from 'components/Loader'
import Spacer from 'components/Spacer'
import { Farm } from 'contexts/Farms'
import { PoolType } from 'contexts/Farms/types'
import useBao from 'hooks/base/useBao'
import useFarms from 'hooks/farms/useFarms'
import useStake from 'hooks/farms/useStake'
import useStakedBalance from 'hooks/farms/useStakedBalance'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useUnstake from 'hooks/farms/useUnstake'
import React, { useEffect, useMemo, useState } from 'react'
import { Accordion, Col, Container, Row } from 'react-bootstrap'
import type { CountdownRenderProps } from 'react-countdown'
import 'react-tabs/style/react-tabs.css'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { bnToDec } from 'utils'
import { getContract } from 'utils/erc20'
import { provider } from 'web3-core'
import Config from '../../../bao/lib/config'
import useAllFarmTVL from 'hooks/farms/useAllFarmTVL'
import GraphUtil from 'utils/graph'
import Multicall from 'utils/multicall'
import { decimate, getDisplayBalance } from 'utils/numberFormat'
import Earnings from './Earnings'
import { Staking } from './Staking'
import { StyledLoadingWrapper } from './styles'
import { NavButtons } from 'components/Button'

export interface FarmWithStakedValue extends Farm {
	apy: BigNumber
	stakedUSD: BigNumber
}

export const FarmList: React.FC = () => {
	const bao = useBao()
	const [farms] = useFarms()
	const farmsTVL = useAllFarmTVL(bao && bao.web3, bao && bao.multicall)
	const { ethereum, account } = useWallet()

	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const [pools, setPools] = useState<any | undefined>({
		[PoolType.ACTIVE]: [],
		[PoolType.ARCHIVED]: [],
	})

	useEffect(() => {
		GraphUtil.getPrice(Config.addressMap.WETH).then(async (wethPrice) => {
			const baoPrice = await GraphUtil.getPriceFromPair(
				wethPrice,
				Config.contracts.bao[Config.networkId].address,
			)
			setBaoPrice(baoPrice)
		})

		const _pools: any = {
			[PoolType.ACTIVE]: [],
			[PoolType.ARCHIVED]: [],
		}
		if (!(ethereum && farmsTVL && bao)) return setPools(_pools)

		bao.multicall
			.call(
				Multicall.createCallContext([
					{
						ref: 'masterChef',
						contract: getMasterChefContract(bao),
						calls: farms
							.map((farm, i) => {
								return {
									ref: i.toString(),
									method: 'getNewRewardPerBlock',
									params: [farm.pid + 1],
								}
							})
							.concat(
								farms.map((farm, i) => {
									return {
										ref: (farms.length + i).toString(),
										method: 'userInfo',
										params: [farm.pid, account],
									}
								}) as any,
							),
					},
				]),
			)
			.then(async (_result: any) => {
				const result = await Multicall.parseCallResults(_result)

				for (let i = 0; i < farms.length; i++) {
					const farm = farms[i]
					const tvlInfo = farmsTVL.tvls.find(
						(fTVL: any) =>
							fTVL.lpAddress.toLowerCase() ===
							farm.lpTokenAddress.toLowerCase(),
					)
					const farmWithStakedValue = {
						...farm,
						poolType: farm.poolType || PoolType.ACTIVE,
						tvl: tvlInfo.tvl,
						stakedUSD: decimate(
							result.masterChef[farms.length + i].values[0].hex,
						)
							.div(decimate(tvlInfo.lpStaked))
							.times(tvlInfo.tvl),
						apy:
							baoPrice && farmsTVL
								? baoPrice
										.times(BLOCKS_PER_YEAR)
										.times(
											new BigNumber(result.masterChef[i].values[0].hex).div(
												10 ** 18,
											),
										)
										.div(tvlInfo.tvl)
								: null,
					}

					_pools[farmWithStakedValue.poolType].push(farmWithStakedValue)
				}
				setPools(_pools)
			})
	}, [farmsTVL, bao])

	const BLOCKS_PER_YEAR = new BigNumber(2336000)

	return (
		<>
			<Spacer size="md" />
			<Row>
				<Col>
					<FarmListHeader headers={['Pool', 'APR', 'LP Staked', 'TVL']} />
					{pools[PoolType.ACTIVE] && pools[PoolType.ACTIVE].length ? (
						pools[PoolType.ACTIVE].map((farm: any, i: number) => (
							<React.Fragment key={i}>
								<FarmListItem farm={farm} />
							</React.Fragment>
						))
					) : (
						<StyledLoadingWrapper>
							<SpinnerLoader block />
						</StyledLoadingWrapper>
					)}
				</Col>
			</Row>
		</>
	)
}

type FarmListHeaderProps = {
	headers: string[]
}

const FarmListHeader: React.FC<FarmListHeaderProps> = ({
	headers,
}: FarmListHeaderProps) => {
	return (
		<Container fluid>
			<Row style={{ padding: '0.5rem 12px' }}>
				{headers.map((header: string) => (
					<FarmListHeaderCol style={{ paddingBottom: '0px' }} key={header}>
						<b>{header}</b>
					</FarmListHeaderCol>
				))}
			</Row>
		</Container>
	)
}

interface FarmListItemProps {
	farm: FarmWithStakedValue
}

const FarmListItem: React.FC<FarmListItemProps> = ({ farm }) => {
	const [startTime, setStartTime] = useState(0)
	const [harvestable, setHarvestable] = useState(0)

	const { account } = useWallet()
	const { pid } = farm
	const bao = useBao()
	const { ethereum } = useWallet()

	const lpTokenAddress = farm.lpTokenAddress

	const lpContract = useMemo(() => {
		return getContract(ethereum as provider, lpTokenAddress)
	}, [ethereum, lpTokenAddress])

	const renderer = (countdownProps: CountdownRenderProps) => {
		const { hours, minutes, seconds } = countdownProps
		const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
		const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
		const paddedHours = hours < 10 ? `0${hours}` : hours
		return (
			<span style={{ width: '100%' }}>
				{paddedHours}:{paddedMinutes}:{paddedSeconds}
			</span>
		)
	}

	useEffect(() => {
		async function fetchEarned() {
			if (bao) return
			const earned = await getEarned(getMasterChefContract(bao), pid, account)
			setHarvestable(bnToDec(earned))
		}
		if (bao && account) {
			fetchEarned()
		}
	}, [bao, pid, account, setHarvestable])

	const poolActive = true // startTime * 1000 - Date.now() <= 0
	const basketMint = 'Get ' + farm.tokenSymbol
	const destination = farm.refUrl
	const pairLink = farm.pairUrl

	const { onStake } = useStake(pid)
	const { onUnstake } = useUnstake(pid)
	const tokenBalance = useTokenBalance(lpContract.options.address)
	const stakedBalance = useStakedBalance(pid)

	const operations = ['Stake', 'Unstake']
	const [operation, setOperation] = useState(operations[0])

	return (
		<Accordion>
			<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
				<StyledAccordionHeader>
					<Row lg={7} style={{ width: '100%' }}>
						<Col>
							<FarmIconContainer>
								<FarmIcon src={farm.iconA} />
								<FarmIcon src={farm.iconB} />
							</FarmIconContainer>
							{farm.name}
						</Col>
						<Col>
							{farm.apy ? (
								farm.apy.gt(0) ? (
									`${farm.apy
										.times(new BigNumber(100))
										.toNumber()
										.toLocaleString('en-US')
										.slice(0, -1)}%`
								) : (
									'N/A'
								)
							) : (
								<SpinnerLoader />
							)}
						</Col>
						<Col>{`$${getDisplayBalance(farm.stakedUSD, 0)}`}</Col>
						<Col>{`$${getDisplayBalance(farm.tvl, 0)}`}</Col>
					</Row>
				</StyledAccordionHeader>

				<StyledAccordionBody>
					<NavButtons
						options={operations}
						active={operation}
						onClick={setOperation}
					/>
					<Row>
						<Col md={6}>
							<Earnings pid={farm.pid} />
						</Col>
						<Col md={6}>
							<Staking farm={farm} operation={operation} />
						</Col>
					</Row>
				</StyledAccordionBody>
			</StyledAccordionItem>
		</Accordion>
	)
}

export const FarmImage = styled.img`
	height: 50px;
	margin-right: ${(props) => props.theme.spacing[3]}px;

	@media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
		height: 40px;
		margin-right: ${(props) => props.theme.spacing[3]}px;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.tablet}px) {
		height: 35px;
		margin-right: ${(props) => props.theme.spacing[3]}px;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
		height: 50px;
		margin-right: ${(props) => props.theme.spacing[3]}px;
	}
`

export const FarmIconContainer = styled.div`
	height: 100%;
	align-items: center;
	margin: 0 auto;
	display: inline-block;
	vertical-align: middle;
	color: ${(props) => props.theme.color.text[100]};

	@media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
		display: none;
	}
`

export const FarmIcon = styled(FarmImage)`
	height: 40px;
	vertical-align: super;
	transition: 200ms;
	user-select: none;
	-webkit-user-drag: none;
	margin-left: -${(props) => props.theme.spacing[3]}px;

	&:first-child {
		margin-left: 0;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
		height: 30px;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.tablet}px) {
		height: 25px;
	}
`

const FarmListHeaderCol = styled(Col)`
	text-align: right;

	&:first-child {
		text-align: left;
	}

	&:last-child {
		margin-right: 46px;
	}
`

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: transparent;
	border-color: transparent;
`

const StyledAccordionBody = styled(Accordion.Body)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	border-top: 2px solid ${(props) => props.theme.color.primary[300]};
`

const StyledAccordionHeader = styled(Accordion.Header)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: 8px;

	img {
		height: 32px;
		margin-right: 0.75rem;
		vertical-align: middle;
	}

	> button {
		background-color: ${(props) => props.theme.color.primary[100]};
		color: ${(props) => props.theme.color.text[100]};
		padding: 1.25rem;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${(props) => props.theme.color.primary[200]};
			color: ${(props) => props.theme.color.text[100]};
			box-shadow: none;
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
			border-bottom-left-radius: 0px;
			border-bottom-right-radius: 0px;
		}

		&:not(.collapsed) {
			transition: none;

			&:focus,
			&:active {
				border-color: ${(props) => props.theme.color.primary[300]};
			}

			::after {
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
					props,
				) =>
					props.theme.color.text[100].replace(
						'#',
						'%23',
					)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		::after {
			// don't turn arrow blue
			background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
				props,
			) =>
				props.theme.color.text[100].replace(
					'#',
					'%23',
				)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
		}

		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}

			&:last-child {
				margin-right: 25px;
			}
		}
	}
`
