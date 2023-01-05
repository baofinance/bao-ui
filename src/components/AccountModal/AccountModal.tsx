import { faCircleCheck, faCircleXmark, faClose, faExternalLinkAlt, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
//import { utils } from 'ethers'
import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useTokenBalance, { useEthBalance } from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import _ from 'lodash'
import Image from 'next/future/image'
import Link from 'next/link'
import { FC, useCallback, useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import { MoonLoader } from 'react-spinners'
import Tooltipped from '../Tooltipped'

interface AccountModalProps {
	show: boolean
	onHide: () => void
}

const AccountModal: FC<AccountModalProps> = ({ show, onHide }) => {
	const { account, chainId, deactivate } = useWeb3React()
	const lockInfo = useLockInfo()

	const handleSignOutClick = useCallback(() => {
		onHide()
		deactivate()
	}, [onHide, deactivate])

	const { transactions, onClearTransactions } = useTransactionProvider()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const [tx, setTx] = useState({})

	useEffect(() => {
		const _tx = localStorage.getItem('transactions')
		if (tx) {
			setTx(_tx)
		}
	}, [transactions, tx])

	return (
		<Modal isOpen={show} onDismiss={onHide}>
			<Modal.Header header={'Account'} onClose={onHide} />
			<Modal.Body>
				<div className={`grid grid-flow-col grid-cols-2 gap-4 p-4`}>
					<div className='flex items-center justify-center'>
						<div
							className={`flex ${
								isDesktop ? 'min-h-[48px] min-w-[48px]' : 'min-h-[36px] min-w-[36px]'
							} items-center rounded-full bg-primary-300`}
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

					<div className='flex items-center justify-center'>
						<div
							className={`flex ${
								isDesktop ? 'min-h-[48px] min-w-[48px]' : 'min-h-[36px] min-w-[36px]'
							} items-center rounded-full bg-primary-300`}
						>
							<Image src='/images/tokens/BAO.png' alt='ETH' width={isDesktop ? 32 : 24} height={isDesktop ? 32 : 24} className='m-auto' />
						</div>
						<div className='ml-2'>
							<Typography variant='base' className='font-medium'>
								{getDisplayBalance(lockInfo ? lockInfo.balance : BigNumber.from(0))}
							</Typography>
							<Typography variant='sm' className='text-text-200'>
								veBAO Balance
							</Typography>
						</div>
					</div>
				</div>
				<>
					<div className='mt-4 flex-1 rounded border border-primary-300 bg-primary-100 pb-3'>
						<Typography variant='base' className='float-left mt-2 px-3 py-2 font-medium text-text-100'>
							Recent Transactions <FontAwesomeIcon icon={faReceipt} className='mx-1 text-text-200' />
						</Typography>

						{Object.keys(transactions).length > 0 && (
							<button
								className='float-right m-3 rounded border-0 bg-primary-300 px-2 py-1 font-medium hover:bg-primary-400'
								onClick={() => {
									onClearTransactions()
								}}
							>
								<FontAwesomeIcon icon={faClose} className='inline' /> <Typography className='inline'>Clear</Typography>
							</button>
						)}

						{Object.keys(transactions).length > 0 ? (
							<>
								{_.reverse(Object.keys(transactions))
									.slice(0, 5)
									.map(txHash => (
										<div key={txHash} className='flex w-full items-center justify-between bg-primary-100 px-3 py-1'>
											{transactions[txHash].receipt ? (
												transactions[txHash].receipt.status === 1 ? (
													<FontAwesomeIcon icon={faCircleCheck} className='text-green' size='sm' />
												) : (
													<FontAwesomeIcon icon={faCircleXmark} className='text-red' />
												)
											) : (
												<MoonLoader size={12} speedMultiplier={0.8} color='#FFD84B' />
											)}
											<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${txHash}`} target='_blank'>
												<a>
													<Typography variant='sm' className='text-end text-text-100 hover:text-text-400'>
														{transactions[txHash].description}
														<Tooltipped content='View on Etherscan'>
															<FontAwesomeIcon icon={faExternalLinkAlt} className='ml-1' size='sm' />
														</Tooltipped>
													</Typography>
												</a>
											</Link>
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
