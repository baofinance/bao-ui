import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import { NavButtons } from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import useBallastInfo from '@/hooks/vaults/useBallastInfo'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useState } from 'react'
import BallastButton from './BallastButton'
import VaultButton from './VaultButton'

export const Ballast = ({
	vaultName,
	synth,
	prices,
	accountLiquidity,
}: {
	vaultName: string
	prices: any
	accountLiquidity: AccountLiquidity
	synth: ActiveSupportedVault
}) => {
	// Ballast
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')
	const wethBalance = useTokenBalance(Config.addressMap.WETH)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)
	const ballastInfo = useBallastInfo(vaultName)

	const aInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm'>
						{vaultName === 'baoUSD' ? `${getDisplayBalance(daiBalance)} DAI` : `${getDisplayBalance(wethBalance)} WETH`}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Reserves:
					</Typography>
					<Typography variant='sm'>{ballastInfo ? getDisplayBalance(ballastInfo.reserves) : <Loader />}</Typography>
				</div>
			</div>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? daiBalance : wethBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'DAI' : 'WETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'DAI' : 'WETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

	const bInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm'>
						{vaultName === 'baoUSD' ? `${getDisplayBalance(baoUSDBalance)} baoUSD` : `${getDisplayBalance(baoETHBalance)} baoETH`}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Mint Limit:
					</Typography>
					<Typography variant='sm'>{ballastInfo ? getDisplayBalance(ballastInfo.supplyCap) : <Loader />}</Typography>
				</div>
			</div>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					!swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

	return (
		<div className='flex flex-row gap-4'>
			<div className='mt-8 flex w-1/2 flex-col'>
				<>
					<Card.Body>
						{swapDirection ? bInput : aInput}
						<div className='mt-4 block select-none text-center'>
							<span
								className='hover:bg-primary-400 m-auto mb-2 flex w-fit items-center justify-center gap-1 rounded-full border-none bg-transparent-100 p-2 text-lg hover:cursor-pointer'
								onClick={() => setSwapDirection(!swapDirection)}
							>
								<FontAwesomeIcon icon={faSync} size='xs' className='m-auto' />
								<Typography variant='xs' className='inline'>
									Fee: {ballastInfo ? `${(100 / 10000) * 100}%` : <Loader />}
								</Typography>
							</span>
						</div>
						{swapDirection ? aInput : bInput}
						<div className='h-4' />
					</Card.Body>
					<Card.Actions>
						<BallastButton
							vaultName={vaultName}
							swapDirection={swapDirection}
							inputVal={inputVal}
							maxValues={{
								buy: vaultName === 'baoUSD' ? daiBalance : wethBalance,
								sell: vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance,
							}}
							supplyCap={ballastInfo ? ballastInfo.supplyCap : BigNumber.from(0)}
							reserves={ballastInfo ? ballastInfo.reserves : BigNumber.from(0)}
						/>
					</Card.Actions>
				</>
			</div>
		</div>
	)
}

export default Ballast
