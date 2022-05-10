import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Button } from '../../../components/Button'
import BasketModal from './Modals/BasketModal'
import { ActiveSupportedBasket } from '../../../bao/lib/types'
import OvenModal from './Modals/OvenModal'

type ModalOperation = 'MINT' | 'REDEEM'

type BasketButtonsProps = {
	basket: ActiveSupportedBasket
}

const BasketButtons: React.FC<BasketButtonsProps> = ({ basket }) => {
	const [showBasketModal, setShowBasketModal] = useState(false)
	const [showOvenModal, setShowOvenModal] = useState(false)
	const [modalOperation, setModalOperation] = useState<ModalOperation>('MINT')

	const handleClick = (op: ModalOperation) => {
		setModalOperation(op)
		setShowBasketModal(true)
	}

	return (
		<>
			<BasketModal
				basket={basket}
				operation={modalOperation}
				show={showBasketModal}
				hideModal={() => setShowBasketModal(false)}
			/>
			<OvenModal
				basket={basket}
				show={showOvenModal}
				hideModal={() => setShowOvenModal(false)}
			/>
			<Row lg={4} style={{ padding: '0 0.75rem', marginBottom: '25px' }}>
				<Col>
					<Button onClick={() => handleClick('MINT')}>Mint</Button>
				</Col>
				<Col>
					<Button onClick={() => handleClick('REDEEM')}>Redeem</Button>
				</Col>
				<Col>
					<Button onClick={() => setShowOvenModal(true)}>Oven</Button>
				</Col>
				<Col>
					<Button>Swap</Button>
				</Col>
			</Row>
		</>
	)
}

export default BasketButtons
