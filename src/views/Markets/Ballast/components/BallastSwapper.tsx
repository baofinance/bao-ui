import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Config from '../../../../bao/lib/config'
import BigNumber from 'bignumber.js'
import useBao from '../../../../hooks/useBao'
import { useWallet } from 'use-wallet'
import useTokenBalance from '../../../../hooks/useTokenBalance'
import { Card } from 'react-bootstrap'
import { SubmitButton } from '../../components/MarketButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BalanceInput } from '../../../../components/Input'
import { decimate, getDisplayBalance } from '../../../../utils/numberFormat'
import { SpinnerLoader } from '../../../../components/Loader'

const BallastSwapper: React.FC = () => {
	const bao = useBao()
	const { account } = useWallet()
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->bUSD | true = bUSD->DAI
	const [inputAVal, setInputAVal] = useState('')
	const [inputBVal, setInputBVal] = useState('')

	const [reserves, setReserves] = useState<BigNumber | undefined>()
	const [supplyCap, setSupplyCap] = useState<BigNumber | undefined>()

	const daiBalance = useTokenBalance(
		'0xDc3c1D7741E454DEC2d2e6CFFe29605E4b7e01e3', // DAI on Ropsten, 18 decimals for test contract
	)
	const bUSDBalance = useTokenBalance(Config.addressMap.bUSD)

	useEffect(() => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		ballastContract.methods
			.supplyCap()
			.call()
			.then((cap: BigNumber) => setSupplyCap(new BigNumber(cap)))
		bao
			.getNewContract(
				'erc20.json',
				'0xDc3c1D7741E454DEC2d2e6CFFe29605E4b7e01e3',
			)
			.methods.balanceOf(ballastContract.options.address)
			.call()
			.then((reserves: BigNumber) => setReserves(new BigNumber(reserves)))
	}, [bao])

	return (
		<BallastSwapCard>
			<h2 style={{ textAlign: 'center' }}>
				<FontAwesomeIcon icon="ship" />
			</h2>
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
				onMaxClick={() => setInputAVal(decimate(daiBalance).toString())}
				onChange={(e) => setInputAVal(e.currentTarget.value)}
				value={inputAVal}
			/>
			<DirectionArrow onClick={() => setSwapDirection(!swapDirection)}>
				<FontAwesomeIcon icon={swapDirection ? 'arrow-up' : 'arrow-down'} />
			</DirectionArrow>
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
				onMaxClick={() => setInputBVal(decimate(bUSDBalance).toString())}
				onChange={(e) => setInputBVal(e.currentTarget.value)}
				value={inputBVal}
			/>
			<br />
			<SubmitButton>
				<FontAwesomeIcon icon="sync-alt" style={{ marginRight: '5px' }} />
				Swap {swapDirection ? 'bUSD to DAI' : 'DAI to bUSD'}
			</SubmitButton>
		</BallastSwapCard>
	)
}

const BallastSwapCard = styled(Card)`
	width: 60%;
	padding: 25px;
	margin: auto;
	background-color: ${(props) => props.theme.color.primary[100]};

	label > span {
		float: right;
		margin-bottom: 0.25rem;
		color: ${(props) => props.theme.color.text[200]};
	}
`

const DirectionArrow = styled.a`
	text-align: center;
	display: block;
	margin-top: 1em;
	color: ${(props) => props.theme.color.text[200]};

	&:hover {
		cursor: pointer;
	}
`

export default BallastSwapper
