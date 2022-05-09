import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Button } from '../../../components/Button'
import BasketModal from './BasketModal'
import { ActiveSupportedBasket } from '../../../bao/lib/types'

type ModalOperation = 'MINT' | 'REDEEM'

type BasketButtonsProps = {
	basket: ActiveSupportedBasket
}

const BasketButtons: React.FC<BasketButtonsProps> = ({ basket }) => {
	const [showModal, setShowModal] = useState(false)
	const [modalOperation, setModalOperation] = useState<ModalOperation>('MINT')

	const handleClick = (op: ModalOperation) => {
		setModalOperation(op)
		setShowModal(true)
	}

	return (
		<>
			<BasketModal
				basket={basket}
				operation={modalOperation}
				show={showModal}
				hideModal={() => setShowModal(false)}
			/>
			<Row lg={4} style={{ padding: '0 0.75rem', marginBottom: '25px' }}>
				<Col>
					<Button onClick={() => handleClick('MINT')}>Mint</Button>
				</Col>
				<Col>
					<Button onClick={() => handleClick('REDEEM')}>Redeem</Button>
				</Col>
				<Col>
					<Button>Oven</Button>
				</Col>
				<Col>
					<Button>Swap</Button>
				</Col>
			</Row>
		</>
	)
}

export default BasketButtons
