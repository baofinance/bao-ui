import Config from '@/bao/lib/config'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBallastInfo from '@/hooks/ballast/useBallastInfo'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faShip, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useState } from 'react'
import { isDesktop } from 'react-device-detect'
import BallastButton from './BallastButton'

const BallastSwapper: React.FC = () => {
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const ballastInfo = useBallastInfo()

	const daiInput = (
		<>
			<Typography variant='sm' className='float-left mb-1'>
				Balance: {getDisplayBalance(daiBalance)} DAI
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Reserves: {ballastInfo ? getDisplayBalance(ballastInfo.reserves) : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(formatEther(daiBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
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
				Balance: {getDisplayBalance(baoUSDBalance)} baoUSD
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Mint Limit: {ballastInfo ? getDisplayBalance(ballastInfo.supplyCap) : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(formatEther(baoUSDBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					!swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image src='/images/tokens/baoUSD.png' height={32} width={32} alt='baoUSD' />
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
							className='m-auto mb-2 flex w-fit items-center justify-center gap-1 rounded-full border-none bg-primary-300 p-2 text-lg hover:cursor-pointer hover:bg-primary-400'
							onClick={() => setSwapDirection(!swapDirection)}
						>
							<FontAwesomeIcon icon={faSync} size='xs' className='m-auto' />
							<Typography variant='xs' className='inline'>
								Fee: {ballastInfo ? `${(100 / 10000) * 100}%` : <Loader />}
							</Typography>
						</span>
					</div>
					{swapDirection ? daiInput : baoUSDInput}
					<div className='h-4' />
				</Card.Body>
				<Card.Actions>
					<BallastButton
						swapDirection={swapDirection}
						inputVal={inputVal}
						maxValues={{
							buy: daiBalance,
							sell: baoUSDBalance,
						}}
						supplyCap={ballastInfo ? ballastInfo.supplyCap : BigNumber.from(0)}
						reserves={ballastInfo ? ballastInfo.reserves : BigNumber.from(0)}
					/>
				</Card.Actions>
			</Card>
		</>
	)
}

export default BallastSwapper
