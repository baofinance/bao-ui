import Config from '@/bao/lib/config'
import { BalanceInput } from '@/components/Input'
import { SpinnerLoader } from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import Tooltipped from '@/components/Tooltipped'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import Multicall from '@/utils/multicall'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faLongArrowAltRight, faShip, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
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
			<label className='!sm:text-sm !xs:text-xs text-default'>
				<FontAwesomeIcon icon={faLongArrowAltRight} /> Balance: {getDisplayBalance(daiBalance).toString()} DAI
			</label>
			<label className='float-right mb-1 text-text-200'>
				Reserves: {reserves ? getDisplayBalance(reserves).toString() : <SpinnerLoader />}{' '}
			</label>
			<BalanceInput
				onMaxClick={() => setInputVal(decimate(daiBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				value={
					swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal).times(new BigNumber(1).minus(fees['sell'].div(fees['denominator']))).toString()
						: inputVal
				}
				disabled={swapDirection}
				label={
					<div className='align-center flex flex-row pl-2 pr-4'>
						<div className='flex justify-center'>
							<Image src='/images/tokens/DAI.png' height={36} width={36} alt='DAI' className='block object-none align-middle' />
						</div>
					</div>
				}
			/>
		</>
	)

	const baoUSDInput = (
		<>
			<label className='!md:text-sm !sm:text-xs text-default'>
				<FontAwesomeIcon icon={faLongArrowAltRight} /> Balance: {getDisplayBalance(baoUSDBalance).toString()} BaoUSD
			</label>
			<label className='float-right mb-1 text-text-200'>
				Mint Limit: {supplyCap ? getDisplayBalance(supplyCap).toString() : <SpinnerLoader />}{' '}
			</label>
			<BalanceInput
				onMaxClick={() => setInputVal(decimate(baoUSDBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				value={
					!swapDirection && fees && !new BigNumber(inputVal).isNaN()
						? new BigNumber(inputVal).times(new BigNumber(1).minus(fees['buy'].div(fees['denominator']))).toString()
						: inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='align-center flex flex-row pl-2 pr-4'>
						<div className='flex justify-center'>
							<Image src='/images/tokens/bUSD.png' height={36} width={36} alt='baoUSD' className='block object-none align-middle' />
						</div>
					</div>
				}
			/>
		</>
	)

	return (
		<>
			<div className='absolute top-[50%] -mt-80 w-full pl-4 pr-4 md:left-[50%] md:-ml-96 md:w-[720px]'>
				<PageHeader title='Ballast' />
				<div className='w-full rounded-lg !border !border-solid !border-primary-400/50 bg-primary-100 p-6 shadow-2xl shadow-primary-100 md:absolute'>
					<h2 className='text-center'>
						<Tooltipped content='The Ballast is used to mint BaoUSD with DAI or to redeem DAI for BaoUSD at a 1:1 rate (not including fees).'>
							<a>
								<FontAwesomeIcon icon={faShip} />
							</a>
						</Tooltipped>
					</h2>
					{swapDirection ? baoUSDInput : daiInput}
					<div className='mt-4 block select-none text-center'>
						<span
							className='text-lg mb-2 rounded-full border-none bg-primary-300 p-2 text-text-100 hover:cursor-pointer hover:bg-primary-400'
							onClick={() => setSwapDirection(!swapDirection)}
						>
							<FontAwesomeIcon icon={faSync} className='m-auto' />
							{/* {' - '}
    Fee: {fees ? `${fees[swapDirection ? 'sell' : 'buy'].div(fees['denominator']).times(100).toString()}%` : <SpinnerLoader />} */}
						</span>
					</div>
					{swapDirection ? daiInput : baoUSDInput}
					<br />
					<BallastButton
						swapDirection={swapDirection}
						inputVal={inputVal}
						maxValues={{ buy: decimate(daiBalance), sell: decimate(baoUSDBalance) }}
						supplyCap={supplyCap}
						reserves={reserves}
					/>
				</div>
			</div>
		</>
	)
}

export default BallastSwapper
