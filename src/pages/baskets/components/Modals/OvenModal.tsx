import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'

import { ActiveSupportedBasket } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useOvenInfo from '@/hooks/baskets/useOvenInfo'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'

type ModalProps = {
	basket: ActiveSupportedBasket
	show: boolean
	hideModal: () => void
}

const OvenModal: React.FC<ModalProps> = ({ basket, show, hideModal }) => {
	const [value, setValue] = useState<string | undefined>()
	const [ethBalance, setEthBalance] = useState<BigNumber | undefined>()

	const { library } = useWeb3React()
	const bao = useBao()
	const { account } = useWeb3React()
	const ovenInfo = useOvenInfo(basket, account)

	useEffect(() => {
		if (!(library && account)) return
		// FIXME: use useBalance('ETH') from eth-hooks maybe?
		library.getBalance(account).then((balance: any) => setEthBalance(decimate(balance)))
	}, [library, account])

	return basket ? (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-text-100'>
						<Typography variant='h3' className='mr-2 mb-0'>
							{basket.symbol} Oven
						</Typography>
						<Image src={basket.icon} width={32} height={32} alt={basket.symbol} />
					</div>
				</Modal.Header>
				<Modal.Body>
					<StatBlock
						label='Oven Information'
						stats={
							ovenInfo && [
								{
									label: 'Total ETH Deposited',
									value: (
										<span>
											{getDisplayBalance(ovenInfo.balance)} <FontAwesomeIcon icon={faEthereum} />
										</span>
									),
								},
								{
									label: 'Your Deposit',
									value: (
										<span>
											{getDisplayBalance(ovenInfo.userBalance)} <FontAwesomeIcon icon={faEthereum} />
										</span>
									),
								},
							]
						}
					/>
					<div className='flex w-full flex-col'>
						<div className='flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='text-text-200'>
										{`Available:`}{' '}
									</Typography>
									<Typography variant='sm'>{`${ethBalance && ethBalance.toFixed(4)} ETH`}</Typography>
								</div>
							</div>
						</div>
						<Input
							value={value}
							onChange={e => setValue(e.currentTarget.value)}
							onSelectMax={undefined}
							label={
								<div className='flex flex-row items-center pl-2 pr-4'>
									<div className='flex w-6 justify-center'>
										<Image src={`/images/tokens/ETH.png`} width={32} height={32} alt='ETH' className='block h-6 w-6 align-middle' />
									</div>
								</div>
							}
						/>
					</div>
				</Modal.Body>
				<Modal.Actions>
					<Button fullWidth onClick={undefined}>
						{!value ? 'Enter a Value' : `Deposit ${value} ETH`}
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default OvenModal
