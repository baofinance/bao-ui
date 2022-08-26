import Config from '@/bao/lib/config'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import Multicall from '@/utils/multicall'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faShip, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useCallback, useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import BallastButton from './BallastButton'

const BallastSwapper: React.FC = () => {
	const bao = useBao()
	const { transactions } = useTransactionProvider()
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')

	const [reserves, setReserves] = useState<BigNumber | undefined>()
	const [supplyCap, setSupplyCap] = useState<BigNumber | undefined>()
	const [fees, setFees] = useState<{ [key: string]: BigNumber } | undefined>()

	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)

	// TODO: Move this to a hook ?
	const fetchBallastInfo = useCallback(async () => {
		const ballastContract = bao.getContract('stabilizer')
		const ballastQueries = Multicall.createCallContext([
			{
				ref: 'Ballast',
				contract: ballastContract,
				calls: [{ method: 'supplyCap' }, { method: 'buyFee' }, { method: 'sellFee' }, { method: 'FEE_DENOMINATOR' }],
			},
			{
				ref: 'DAI',
				contract: bao.getNewContract('erc20.json', Config.addressMap.DAI),
				calls: [{ method: 'balanceOf', params: [ballastContract.options.address] }],
			},
		])
		const { Ballast: ballastRes, DAI: daiRes } = Multicall.parseCallResults(await bao.multicall.call(ballastQueries))

		setSupplyCap(new BigNumber(ballastRes[0].values[0].hex))
		setFees({
			buy: new BigNumber(ballastRes[1].values[0].hex),
			sell: new BigNumber(ballastRes[2].values[0].hex),
			denominator: new BigNumber(ballastRes[3].values[0].hex),
		})
		setReserves(new BigNumber(daiRes[0].values[0].hex))
	}, [bao])

	useEffect(() => {
		if (!bao) return

		fetchBallastInfo()
	}, [bao, fetchBallastInfo, transactions])

	const daiInput = (
		<>
			<Typography variant='sm' className='float-left mb-1'>
				Balance: {getDisplayBalance(daiBalance).toString()} DAI
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Reserves: {reserves ? getDisplayBalance(reserves).toString() : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(decimate(daiBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				value={
					swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal).times(new BigNumber(1).minus(fees['sell'].div(fees['denominator']))).toString()
						: inputVal
				}
				disabled={swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image src='/images/tokens/DAI.png' height={32} width={32} alt='baoUSD' />
						</div>
					</div>
				}
			/>
		</>
	)

	const baoUSDInput = (
		<>
			<Typography variant='sm' className='float-left mb-1'>
				Balance: {getDisplayBalance(baoUSDBalance).toString()} baoUSD
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Mint Limit: {supplyCap ? getDisplayBalance(supplyCap).toString() : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(decimate(baoUSDBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				value={
					!swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal).times(new BigNumber(1).minus(fees['buy'].div(fees['denominator']))).toString()
						: inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image src='/images/tokens/bUSD.png' height={32} width={32} alt='baoUSD' />
						</div>
					</div>
				}
			/>
		</>
	)

	return (
		<>
			<PageHeader title='Ballast' />
			<Card className={`${isDesktop && 'mx-auto max-w-[80%]'}`}>
				<Card.Header
					header={
						<Tooltipped content='The Ballast is used to mint baoUSD with DAI or to redeem DAI for baoUSD at a 1:1 rate (not including fees).'>
							<a>
								<FontAwesomeIcon className='text-4xl' icon={faShip} />
							</a>
						</Tooltipped>
					}
				/>
				<Card.Body>
					{swapDirection ? baoUSDInput : daiInput}
					<div className='mt-4 block select-none text-center'>
						<span
							className='mb-2 rounded-full border-none bg-primary-300 p-2 text-lg text-text-100 hover:cursor-pointer hover:bg-primary-400'
							onClick={() => setSwapDirection(!swapDirection)}
						>
							<FontAwesomeIcon icon={faSync} className='m-auto' />
							{/* {' - '}
    Fee: {fees ? `${fees[swapDirection ? 'sell' : 'buy'].div(fees['denominator']).times(100).toString()}%` : <Loader />} */}
						</span>
					</div>
					{swapDirection ? daiInput : baoUSDInput}
					<div className='h-4' />
				</Card.Body>
				<Card.Actions>
					<BallastButton
						swapDirection={swapDirection}
						inputVal={inputVal}
						maxValues={{ buy: decimate(daiBalance), sell: decimate(baoUSDBalance) }}
						supplyCap={supplyCap}
						reserves={reserves}
					/>
				</Card.Actions>
			</Card>
		</>
	)
}

export default BallastSwapper
