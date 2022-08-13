import Config from '@/bao/lib/config'
import { BalanceInput } from '@/components/Input'
import { SpinnerLoader } from '@/components/Loader'
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
	}, [bao, transactions])

	useEffect(() => {
		if (!bao) return

		fetchBallastInfo()
	}, [bao, transactions])

	const daiInput = (
		<>
			<label className='!md:text-sm !sm:text-xs text-default'>
				<FontAwesomeIcon icon={faLongArrowAltRight} /> Balance: {getDisplayBalance(daiBalance).toString()} DAI
				<span className='float-right text-text-200 mb-1'>
					Reserves: {reserves ? getDisplayBalance(reserves).toString() : <SpinnerLoader />}{' '}
				</span>
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
						<div className='flex w-6 justify-center'>
							<Image src='/images/tokens/DAI.png' height={32} width={32} alt='DAI' className='block h-6 w-6 align-middle' />
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
				<span className='float-right text-text-200 mb-1'>
					Mint Limit: {supplyCap ? getDisplayBalance(supplyCap).toString() : <SpinnerLoader />}{' '}
				</span>
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
						<div className='flex w-6 justify-center'>
							<Image src='/images/tokens/bUSD.png' height={32} width={32} alt='baoUSD' className='block h-6 w-6 align-middle' />
						</div>
					</div>
				}
			/>
		</>
	)

	return (
		<>
			<div className='xs:w-full absolute w-[720px] top-[50%] left-[50%] -mt-60 -ml-80'>
				<h1 className='text-text-dark-100 font-kaushan text-xxxl font-strong tracking-tighter antialiased text-center'>Ballast</h1>
				<div className='xs:w-full absolute w-[720px] bg-primary-100 shadow-2xl rounded-lg !border !border-solid !border-primary-400/50 p-6'>
					<h2 className='text-center'>
						<Tooltipped content='The Ballast is used to mint BaoUSD with DAI or to redeem DAI for BaoUSD at a 1:1 rate (not including fees).'>
							<a>
								<FontAwesomeIcon icon={faShip} />
							</a>
						</Tooltipped>
					</h2>
					{swapDirection ? baoUSDInput : daiInput}
					<a className='block select-none text-text-200 duration-200 mt-4 text-center hover:cursor-pointer'>
						<span
							className='border-none bg-primary-300 text-text-100 mb-2 rounded-full p-2 hover:bg-primary-400 md:text-sm'
							onClick={() => setSwapDirection(!swapDirection)}
						>
							<FontAwesomeIcon icon={faSync} className='text-md hover:animate-spin' />
							{/* {' - '}
    Fee: {fees ? `${fees[swapDirection ? 'sell' : 'buy'].div(fees['denominator']).times(100).toString()}%` : <SpinnerLoader />} */}
						</span>
					</a>
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
