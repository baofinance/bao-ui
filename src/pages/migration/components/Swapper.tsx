import Config from '@/bao/lib/config'
import { approve } from '@/bao/utils'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'

const Swapper: React.FC = () => {
	const [inputVal, setInputVal] = useState('')

	// FIXME: maybe this should be an ethers.BigNumber
	const baov1Balance = useTokenBalance(Config.addressMap.BAO)

	return (
		<>
			<Card className={`${isDesktop && 'mx-auto max-w-[80%]'}`}>
				<Card.Body>
					<Typography variant='sm' className='float-right mb-1'>
						Balance: {getDisplayBalance(baov1Balance).toString()} BAOv1
					</Typography>
					<Input
						onSelectMax={() => setInputVal(decimate(baov1Balance).toString())}
						onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
						value={inputVal}
						label={
							<div className='flex flex-row items-center pl-2 pr-4'>
								<div className='flex w-6 items-center justify-center'>
									<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
									<Typography variant='sm'>v1</Typography>
								</div>
							</div>
						}
					/>
					<div className='mt-4 block select-none text-center'>
						<span className='mb-2 rounded-full border-none bg-primary-300 p-2 text-lg'>
							<FontAwesomeIcon icon={faArrowDown} size='sm' className='m-auto' />
						</span>
					</div>
					<div className='h-4' />
					<Input
						onSelectMax={null}
						onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
						disabled={true}
						value={inputVal && new BigNumber(inputVal).times(0.001).toString()}
						label={
							<div className='flex flex-row items-center pl-2 pr-4'>
								<div className='flex w-6 items-center justify-center'>
									<Image src='/images/tokens/BAO.png' height={32} width={32} alt='BAO' />
									<Typography variant='sm'>v2</Typography>
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
		</>
	)
}

export default Swapper

const SwapperButton: React.FC<SwapperButtonProps> = ({ inputVal, maxValue }: SwapperButtonProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()

	const inputApproval = useAllowance(Config.addressMap.BAO, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao) return

		const SwapperContract = bao.getContract('stabilizer') // FIXME: needs signer
		// BAOv1->BAOv2
		if (!inputApproval.gt(0)) {
			const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.BAO)
			return handleTx(approve(tokenContract, SwapperContract, account), 'Migration: Approve BAOv1')
		}

		handleTx(SwapperContract.sell(exponentiate(inputVal).toString()), 'Migration: Swap BAOv1 to BAOv2')
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

	const isDisabled = useMemo(
		() => typeof pendingTx === 'string' || pendingTx || new BigNumber(inputVal).isNaN() || new BigNumber(inputVal).gt(maxValue),
		[pendingTx, inputVal],
	)

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
