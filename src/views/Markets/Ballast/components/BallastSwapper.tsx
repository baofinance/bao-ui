import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Config from '../../../../bao/lib/config'
import BigNumber from 'bignumber.js'
import Multicall from '../../../../utils/multicall'
import useBao from '../../../../hooks/useBao'
import useTransactionProvider from '../../../../hooks/useTransactionProvider'
import useTokenBalance from '../../../../hooks/useTokenBalance'
import { Card, Badge } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BalanceInput } from '../../../../components/Input'
import { SpinnerLoader } from '../../../../components/Loader'
import BallastButton from './BallastButton'
import Tooltipped from '../../../../components/Tooltipped'
import { decimate, getDisplayBalance } from '../../../../utils/numberFormat'

const BallastSwapper: React.FC = () => {
	const bao = useBao()
	const { transactions } = useTransactionProvider()
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->bUSD | true = bUSD->DAI
	const [inputVal, setInputVal] = useState('')

	const [reserves, setReserves] = useState<BigNumber | undefined>()
	const [supplyCap, setSupplyCap] = useState<BigNumber | undefined>()
	const [fees, setFees] = useState<{ [key: string]: BigNumber } | undefined>()

	const daiBalance = useTokenBalance(
		'0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108', // Test DAI
	)
	const bUSDBalance = useTokenBalance(Config.addressMap.bUSD)

	// TODO: Move this to a hook ?
	const fetchBallastInfo = useCallback(async () => {
		const ballastContract = bao.getContract('stabilizer')
		const ballastQueries = Multicall.createCallContext([
			{
				ref: 'Ballast',
				contract: ballastContract,
				calls: [
					{ method: 'supplyCap' },
					{ method: 'buyFee' },
					{ method: 'sellFee' },
					{ method: 'FEE_DENOMINATOR' },
				],
			},
			{
				ref: 'DAI',
				contract: bao.getNewContract(
					'erc20.json',
					'0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108', // Test DAI
				),
				calls: [
					{ method: 'balanceOf', params: [ballastContract.options.address] },
				],
			},
		])
		const { Ballast: ballastRes, DAI: daiRes } = Multicall.parseCallResults(
			await bao.multicall.call(ballastQueries),
		)

		setSupplyCap(new BigNumber(ballastRes[0].values[0].hex))
		setFees({
			buy: new BigNumber(ballastRes[1].values[0].hex),
			sell: new BigNumber(ballastRes[2].values[0].hex),
			denominator: new BigNumber(ballastRes[3].values[0].hex),
		})
		setReserves(new BigNumber(daiRes[0].values[0].hex))
	}, [bao, transactions])

	useEffect(() => {
		if (!bao) return

		fetchBallastInfo()
	}, [bao, transactions])

	const daiInput = (
		<>
			<label>
				<FontAwesomeIcon icon="long-arrow-alt-right" /> Balance:{' '}
				{getDisplayBalance(daiBalance).toString()} DAI
				<span>
					Reserves:{' '}
					{reserves ? (
						getDisplayBalance(reserves).toString()
					) : (
						<SpinnerLoader />
					)}{' '}
					DAI
				</span>
			</label>
			<BalanceInput
				onMaxClick={() =>
					setInputVal(
						decimate(daiBalance)
							.times(
								new BigNumber(1).minus(
									fees[swapDirection ? 'sell' : 'buy'].div(fees['denominator']),
								),
							)
							.toString(),
					)
				}
				onChange={(e) => setInputVal(e.currentTarget.value)}
				value={
					swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal)
								.times(
									new BigNumber(1).minus(fees['sell'].div(fees['denominator'])),
								)
								.toString()
						: inputVal
				}
				disabled={swapDirection}
			/>
		</>
	)

	const bUSDInput = (
		<>
			<label>
				<FontAwesomeIcon icon="long-arrow-alt-right" /> Balance:{' '}
				{getDisplayBalance(bUSDBalance).toString()} bUSD
				<span>
					Mint Limit:{' '}
					{supplyCap ? (
						getDisplayBalance(supplyCap).toString()
					) : (
						<SpinnerLoader />
					)}{' '}
					bUSD
				</span>
			</label>
			<BalanceInput
				onMaxClick={() =>
					setInputVal(
						decimate(bUSDBalance)
							.times(
								new BigNumber(1).minus(
									fees[swapDirection ? 'sell' : 'buy'].div(fees['denominator']),
								),
							)
							.toString(),
					)
				}
				onChange={(e) => setInputVal(e.currentTarget.value)}
				value={
					!swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal)
								.times(
									new BigNumber(1).minus(fees['sell'].div(fees['denominator'])),
								)
								.toString()
						: inputVal
				}
				disabled={!swapDirection}
			/>
		</>
	)

	return (
		<BallastSwapCard>
			<h2 style={{ textAlign: 'center' }}>
				<Tooltipped content="The Ballast is used to mint bUSD with DAI or to redeem DAI for bUSD at a 1:1 rate (not including fees).">
					<a>
						<FontAwesomeIcon icon="ship" />
					</a>
				</Tooltipped>
			</h2>
			{swapDirection ? bUSDInput : daiInput}
			<SwapDirection onClick={() => setSwapDirection(!swapDirection)}>
				<Badge pill>
					<FontAwesomeIcon icon="sync" />
					{' - '}
					Fee:{' '}
					{fees ? (
						`${fees[swapDirection ? 'sell' : 'buy']
							.div(fees['denominator'])
							.times(100)
							.toString()}%`
					) : (
						<SpinnerLoader />
					)}
				</Badge>
			</SwapDirection>
			{swapDirection ? daiInput : bUSDInput}
			<br />
			<BallastButton
				swapDirection={swapDirection}
				inputVal={inputVal}
				maxValues={{ buy: decimate(daiBalance), sell: decimate(bUSDBalance) }}
				supplyCap={supplyCap}
				reserves={reserves}
				fees={fees}
			/>
		</BallastSwapCard>
	)
}

const BallastSwapCard = styled(Card)`
	width: 60%;
	padding: 25px;
	margin: auto;
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;

	label > span {
		float: right;
		margin-bottom: 0.25rem;
		color: ${(props) => props.theme.color.text[200]};
	}
`

const SwapDirection = styled.a`
	text-align: center;
	display: block;
	margin-top: 1em;
	color: ${(props) => props.theme.color.text[200]};

	> span {
		background-color: ${(props) => props.theme.color.text[300]};
	}

	&:hover {
		cursor: pointer;
	}
`

export default BallastSwapper
