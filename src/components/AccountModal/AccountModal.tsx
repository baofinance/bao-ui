import { faCheck, faClose, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import _ from 'lodash'
import Image from 'next/future/image'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import { MoonLoader } from 'react-spinners'

import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { getBalanceNumber, getDisplayBalance } from '@/utils/numberFormat'

interface AccountModalProps {
	show: boolean
	onHide: () => void
}

const AccountModal: FC<AccountModalProps> = ({ show, onHide }) => {
	const { account, deactivate } = useWeb3React()

	const handleSignOutClick = useCallback(() => {
		onHide()
		deactivate()
	}, [onHide, deactivate])

	const { transactions } = useTransactionProvider()
	const baoBalance = useTokenBalance(Config.addressMap.BAO)
	const ethBalance = useTokenBalance('ETH')
	const [tx, setTx] = useState({})

	useEffect(() => {
		const tx = localStorage.getItem('transactions')
		if (tx) {
			setTx(tx)
		}
	}, [transactions, tx])

	return (
		<Modal isOpen={show} onDismiss={onHide}>
			<Modal.Header header={'My Account'} onClose={onHide} />
			<Modal.Body>
				<div className={`grid grid-flow-col grid-cols-2 gap-4 px-4 pt-4 pb-4`}>
					<div className='flex items-center justify-center'>
						<div
							className={`flex ${
								isDesktop ? 'min-h-[48px] min-w-[48px]' : 'min-h-[36px] min-w-[36px]'
							} items-center justify-center rounded-full border-0 bg-primary-300`}
						>
							<Image src='/images/tokens/ETH.png' alt='ETH' width={isDesktop ? 32 : 24} height={isDesktop ? 32 : 24} className='m-auto' />
						</div>
						<div className='ml-2'>
							<Typography variant='base' className='font-medium'>
								{getBalanceNumber(ethBalance).toFixed(4)}
							</Typography>
							<Typography variant='sm' className='text-text-200'>
								ETH Balance
							</Typography>
						</div>
					</div>

					<div className='flex items-center justify-center'>
						<div
							className={`flex ${
								isDesktop ? 'min-h-[48px] min-w-[48px]' : 'min-h-[36px] min-w-[36px]'
							} items-center justify-center rounded-full border-0 bg-primary-300`}
						>
							<Image src='/images/tokens/BAO.png' alt='ETH' width={isDesktop ? 32 : 24} height={isDesktop ? 32 : 24} className='m-auto' />
						</div>
						<div className='ml-2'>
							<Typography variant='base' className='font-medium'>
								{getDisplayBalance(baoBalance)}
							</Typography>
							<Typography variant='sm' className='text-text-200'>
								BAO Balance
							</Typography>
						</div>
					</div>
				</div>
				<>
					<div className='relative mt-4 flex-1 rounded-lg border border-primary-300 bg-primary-100 pb-3'>
						<Typography variant='base' className='float-left mt-2 px-3 py-2 font-medium'>
							Recent Transactions <FontAwesomeIcon icon={faReceipt} className='mx-2 my-0 text-text-200' />
						</Typography>

						{Object.keys(transactions).length > 0 && (
							<button
								className='float-right m-3 rounded-lg border-0 bg-primary-300 px-2 py-1 text-xs font-medium hover:bg-primary-400'
								onClick={() => {
									localStorage.removeItem('transactions')
								}}
							>
								<FontAwesomeIcon icon={faClose} /> <span>Clear</span>
							</button>
						)}

						{Object.keys(transactions).length > 0 ? (
							<>
								{_.reverse(Object.keys(transactions))
									.slice(0, 5)
									.map(txHash => (
										<div
											key={txHash}
											className='flex min-h-[2rem] w-full items-center justify-between rounded-lg rounded-t-none bg-primary-100 px-3 py-1'
										>
											{transactions[txHash].receipt ? (
												<FontAwesomeIcon icon={faCheck} className='ml-1 text-green' />
											) : (
												<MoonLoader size={12} speedMultiplier={0.8} color='#FFD84B' />
											)}
											<Typography variant='sm' className='text-end text-text-200'>
												{transactions[txHash].description}
											</Typography>
										</div>
									))}
							</>
						) : (
							<div className='flex w-full items-center px-3 py-1'>
								<Typography variant='sm' className='text-end font-normal text-text-200'>
									Completed transactions will show here...
								</Typography>
							</div>
						)}
					</div>
				</>
			</Modal.Body>
			<Modal.Actions>
				<Button
					fullWidth
					className='w-full'
					href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${account}`}
					text='View on Explorer'
				/>
				<Button fullWidth onClick={handleSignOutClick} text='Sign out' />
			</Modal.Actions>
		</Modal>
	)
}

export default AccountModal
