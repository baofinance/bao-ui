import { getDisplayBalance } from '@/utils/numberFormat'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faAngleDoubleRight, faLink, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
//import { utils } from 'ethers'
import { isDesktop } from 'react-device-detect'
import Image from 'next/future/image'

import useTokenBalance, { useEthBalance } from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'

import AccountModal from '../AccountModal'
import Button from '../Button'
import Loader from '../Loader'
import WalletProviderModal from '../WalletProviderModal'
import { default as UDResolution } from '@unstoppabledomains/resolution'
import { Listbox, Transition } from '@headlessui/react'
import classNames from 'classnames'
import Typography from '../Typography'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import Config from '@/bao/lib/config'

const udResolution = new UDResolution()
async function udReverseAddress(address: string): Promise<string> {
	const domain = await udResolution.reverse(address)
	return domain
}

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = () => {
	const { account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [showAccountModal, setShowAccountModal] = useState(false)
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)
	const [ens, setEns] = useState<string | undefined>()
	const [ud, setUd] = useState<string | undefined>()

	const [selectedAsset, setSelectedAsset] = useState('ETH')
	const ethBalance = useEthBalance()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const assets = [
		['0', 'ETH', ethBalance.toString()],
		['1', 'BAO', baoBalance.toString()],
	]
	const asset = assets.length ? assets.find(asset => asset[1] === selectedAsset) : assets.find(asset => asset[1] === 'ETH')

	useEffect(() => {
		const ensResolver = new ethers.providers.JsonRpcProvider(`${process.env.NEXT_PUBLIC_ALCHEMY_API_URL}`)
		if (!account) return
		ensResolver.lookupAddress(account).then(_ens => {
			if (_ens) setEns(_ens)
		})
	}, [account])

	useEffect(() => {
		if (!account) return
		udReverseAddress(account).then(_ud => {
			if (_ud) setUd(_ud)
		})
	}, [account])

	const pendingTxs = useMemo(() => Object.keys(transactions).filter(txHash => !transactions[txHash].receipt).length, [transactions])

	const vanityId = ens || ud
	const vanityAddress = account ? `${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}` : '0x0000...abcd'
	const displayId = vanityId || vanityAddress

	return (
		<>
			{isDesktop &&
				(!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						Connect <FontAwesomeIcon icon={faLink} className='ml-1' />
					</Button>
				) : (
					<>
						<Button onClick={() => setShowAccountModal(true)} size='sm'>
							<div className='items-center'>
								{displayId}
								{pendingTxs > 0 && (
									<>
										<FontAwesomeIcon icon={faAngleDoubleRight} className='mx-2 -mt-1 text-baoRed' />
										<Loader />
										<span className='ml-2'>{pendingTxs}</span>
										<FontAwesomeIcon icon={faReceipt} className='mx-2 -mt-1 text-baoRed' />
									</>
								)}
							</div>
						</Button>
						<Listbox value={selectedAsset} onChange={setSelectedAsset}>
							{({ open }) => (
								<>
									<div>
										<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
											<div className='m-1 flex w-fit rounded-full border border-baoWhite border-opacity-20 bg-baoWhite bg-opacity-5 px-4 py-2 hover:border-baoRed hover:bg-transparent-300'>
												<div className='w-full text-baoWhite'>
													<div className='h-full items-start'>
														<span className='inline-block text-left align-middle'>
															<Typography variant='xl' className='font-bakbak'>
																{getDisplayBalance(asset[2])}
															</Typography>
														</span>
														<div className='ml-2 inline-block'>
															<Image
																className='z-10 inline-block select-none'
																src={`/images/tokens/${asset[1]}.png`}
																alt={asset[1]}
																width={24}
																height={24}
															/>
														</div>
													</div>
												</div>
											</div>
										</Listbox.Button>
										<Transition
											show={open}
											as={Fragment}
											leave='transition ease-in duration-100'
											leaveFrom='opacity-100'
											leaveTo='opacity-0'
										>
											<Listbox.Options className='absolute z-10 origin-bottom-left overflow-hidden rounded-lg bg-baoBlack bg-opacity-80 p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none'>
												{assets.map(([index, symbol, balance]) => (
													<Listbox.Option
														key={index}
														className={({ active }) =>
															classNames(
																active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
																'cursor-pointer select-none rounded-lg border border-baoBlack border-opacity-0 p-2 text-sm',
															)
														}
														value={symbol}
													>
														{({ selected, active }) => (
															<div className='mx-0 my-auto items-center gap-4'>
																<span className='inline-block text-left align-middle'>
																	<Typography variant='xl' className='font-bakbak'>
																		{getDisplayBalance(balance)}
																	</Typography>
																</span>
																<div className='ml-2 inline-block'>
																	<Image
																		className='z-10 inline-block select-none'
																		src={`/images/tokens/${symbol}.png`}
																		alt={symbol}
																		width={24}
																		height={24}
																	/>
																</div>
															</div>
														)}
													</Listbox.Option>
												))}
											</Listbox.Options>
										</Transition>
									</div>
								</>
							)}
						</Listbox>
					</>
				))}

			{!isDesktop &&
				(!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						{' '}
						Connect <FontAwesomeIcon icon={faLink} className='ml-4' />
					</Button>
				) : (
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						{account.slice(0, 6)}...
						{account.slice(account.length - 4, account.length)}
					</Button>
				))}

			<AccountModal show={showAccountModal} onHide={() => setShowAccountModal(false)} />

			<WalletProviderModal show={showWalletProviderModal} onHide={() => setShowWalletProviderModal(false)} />
		</>
	)
}

export default AccountButton
