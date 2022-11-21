import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Bao, Baov2, Swapper } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { decimate, getDisplayBalance, isBigNumberish } from '@/utils/numberFormat'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

const LiquidSwap: React.FC = () => {
	const { library, account, chainId } = useWeb3React()
	const [inputVal, setInputVal] = useState('')

	// FIXME: maybe this should be an ethers.BigNumber
	const baov1Balance = useTokenBalance(Config.contracts.Bao[chainId].address)
	const baov2Balance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const swapper = useContract<Swapper>('Swapper', Config.contracts.Swapper[chainId].address)
	const baoV2 = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)

	const initialSwapperBalance = parseUnits('166850344.226331394130869546')
	const enabled = !!chainId && !!account && !!library && !!swapper && !!baoV2
	const { data: swapperBalance, refetch } = useQuery(
		['swapperBalance', { enabled }, providerKey(library, account, chainId)],
		async () => {
			if (!enabled) throw new Error('not enabled')
			const _balance = await baoV2['balanceOf(address)'](swapper?.address)
			return _balance
		},
		{
			enabled,
			placeholderData: BigNumber.from(1),
		},
	)

	const claimedBao = swapperBalance && initialSwapperBalance.sub(swapperBalance)

	const _refetch = () => {
		// # HACKY: skip this time around the eventloop lol
		if (enabled) setTimeout(() => refetch(), 0)
	}

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return (
		<div className='flex flex-col items-center'>
			<div className='sm:w-4/5'>
				<div className='border-b border-text-100 pb-5'>
					<Typography variant='lg' className='text-lg font-bold text-text-100'>
						Exchange Unlocked BAO
					</Typography>
					<Typography className='mt-2 text-text-200'>
						All tokens, whether circulating or locked, will be converted at a supply reduction of 1,000:1, relative to the ~1 trillion
						supply when we took the snapshot on 11/19/2022. The new initial supply will be ~1 billion BAOv2 and will increase depending upon
						issuance from voting escrow emissions.
					</Typography>
				</div>
				<div className='flex flex-row gap-4'>
					<div className='flex w-3/4 flex-col'>
						<Card className={`mt-8 h-[300px]`}>
							<Card.Body>
								<div className='mt-2 mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='text-text-200'>
										Wallet
									</Typography>
									<Typography variant='sm'>{getDisplayBalance(baov1Balance)} BAO v1</Typography>
								</div>
								<Input
									onSelectMax={() => setInputVal(baov1Balance.toString())}
									onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
									value={inputVal && formatUnits(decimate(parseUnits(inputVal)))}
									label={
										<div className='flex flex-row items-center pl-2 pr-4'>
											<div className='flex w-6 items-center justify-center'>
												<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
												<Typography variant='sm' className='font-medium'>
													v1
												</Typography>
											</div>
										</div>
									}
								/>
								<div className='mt-4 block select-none text-center'>
									<span className='mb-2 rounded-full border-none bg-primary-300 p-2 text-lg'>
										<FontAwesomeIcon icon={faArrowDown} size='sm' className='m-auto' />
									</span>
								</div>
								<div className='flex w-full flex-row'>
									<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
										<Typography variant='sm' className='text-text-200'>
											Wallet
										</Typography>
										<Typography variant='sm'>{getDisplayBalance(baov2Balance)} BAO v2</Typography>
									</div>
								</div>
								<Input
									onSelectMax={null}
									onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
									disabled={true}
									value={inputVal && formatUnits(decimate(parseUnits(inputVal).mul(parseUnits('0.001')), 36))}
									label={
										<div className='flex flex-row items-center pl-2 pr-4'>
											<div className='flex w-6 items-center justify-center'>
												<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
												<Typography variant='sm' className='font-medium'>
													v2
												</Typography>
											</div>
										</div>
									}
								/>
								<div className='h-4' />
							</Card.Body>
							<Card.Actions>
								<SwapperButton inputVal={inputVal} maxValue={decimate(baov1Balance)} />
							</Card.Actions>
						</Card>
					</div>
					<div className='flex w-1/2 flex-col'>
						<Card className='mt-8 h-[300px] w-full'>
							<Card.Header header='Migration Progress' />
							<div className='m-auto w-[200px]'>
								<CircularProgressbarWithChildren
									value={claimedBao && parseFloat(formatUnits(claimedBao.div(swapperBalance).mul(100)))}
									strokeWidth={10}
									styles={buildStyles({
										strokeLinecap: 'butt',
										pathColor: `#FFD84B`,
									})}
								>
									<div className='max-w-[16.6666666667%] basis-[16.6666666667%]'>
										<div className='relative left-1/2 h-[130px] w-[130px] -translate-x-1/2 rounded-full bg-primary-100'>
											<div
												className='absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center rounded-full p-1'
												style={{ marginTop: '15px' }}
											>
												<Typography variant='sm' className='text-text-200'>
													BAOv1 Redeemed
												</Typography>
												<Typography>
													{claimedBao && parseFloat(formatUnits(claimedBao.div(swapperBalance).mul(100))).toFixed(2)}%
												</Typography>
											</div>
										</div>
									</div>
								</CircularProgressbarWithChildren>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LiquidSwap

const SwapperButton: React.FC<SwapperButtonProps> = ({ inputVal, maxValue }: SwapperButtonProps) => {
	const bao = useBao()
	const { pendingTx, handleTx } = useTransactionHandler()

	const { chainId, account } = useWeb3React()
	const baoContract = useContract<Bao>('Bao')
	const inputApproval = useAllowance(Config.contracts.Bao[chainId].address, Config.contracts.Swapper[chainId].address)

	const swapper = useContract<Swapper>('Swapper')

	const handleClick = async () => {
		if (!bao) return

		// BAOv1->BAOv2
		if (!inputApproval.gt(0)) {
			const tx = baoContract.approve(
				swapper.address,
				ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
			)

			return handleTx(tx, 'Migration: Approve BAOv1')
		}

		handleTx(swapper.convertV1(account, inputVal), 'Migration: Swap BAOv1 to BAOv2')
	}

	const buttonText = () => {
		if (!inputApproval) return <Loader />

		if (pendingTx) {
			return typeof pendingTx === 'string' ? (
				<a href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer'>
					Pending Transaction <FontAwesomeIcon icon='external-link-alt' />
				</a>
			) : (
				'Pending Transaction'
			)
		} else {
			return inputApproval.gt(0) ? 'Swap BAOv1 for BAOv2' : 'Approve BAOv1'
		}
	}

	const isDisabled = useMemo(() => typeof pendingTx === 'string' || pendingTx || !isBigNumberish(inputVal), [pendingTx, inputVal, maxValue])

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled}>
			{buttonText()}
		</Button>
	)
}

type SwapperButtonProps = {
	inputVal: string
	maxValue: BigNumber
}
