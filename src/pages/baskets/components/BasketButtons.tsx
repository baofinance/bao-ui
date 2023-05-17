import React, { useState } from 'react'

import Button from '@/components/Button'

import { ActiveSupportedBasket } from '../../../bao/lib/types'
import BasketModal from './Modals/BasketModal'

type ModalOperation = 'MINT' | 'REDEEM'

type BasketButtonsProps = {
	basket: ActiveSupportedBasket
	swapLink: string
}

const BasketButtons: React.FC<BasketButtonsProps> = ({ basket, swapLink }) => {
	const [showBasketModal, setShowBasketModal] = useState(false)
	const [modalOperation, setModalOperation] = useState<ModalOperation>('MINT')

	const handleClick = (op: ModalOperation) => {
		setModalOperation(op)
		setShowBasketModal(true)
	}

	return (
		<>
			<BasketModal basket={basket} operation={modalOperation} show={showBasketModal} hideModal={() => setShowBasketModal(false)} />
			<div className='mt-4 grid grid-cols-3 gap-4'>
				<div>
					<Button fullWidth onClick={() => handleClick('MINT')} className='glassmorphic-card !justify-center !text-center'>
						Mint
					</Button>
				</div>
				<div>
					<Button fullWidth onClick={() => handleClick('REDEEM')} className='glassmorphic-card !justify-center !text-center'>
						Redeem
					</Button>
				</div>
				<div>
					<a href={`${swapLink}`} target='_blank' rel='noreferrer'>
						<Button fullWidth text='Swap' disabled={basket.name === 'bETH'} className='glassmorphic-card !justify-center !text-center' />
					</a>
				</div>
			</div>
		</>
	)
}

export default BasketButtons
