import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import { Button } from '../../../components/Button'
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

	console.log(swapLink)

	return (
		<>
			<BasketModal basket={basket} operation={modalOperation} show={showBasketModal} hideModal={() => setShowBasketModal(false)} />
			<Row lg={3} style={{ padding: '0 0.75rem', marginBottom: '25px' }}>
				<Col>
					<Button onClick={() => handleClick('MINT')}>Mint</Button>
				</Col>
				<Col>
					<Button onClick={() => handleClick('REDEEM')}>Redeem</Button>
				</Col>
				<Col>
					<Button href={`${swapLink}`} target='_blank' text='Swap' />
				</Col>
			</Row>
		</>
	)
}

export default BasketButtons
