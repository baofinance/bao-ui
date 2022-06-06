import React, { useState } from 'react'
import {
	Col,
	OverlayTrigger,
	Row,
	Tooltip,
	Button as TempButton,
} from 'react-bootstrap'
import { Button } from '../../../components/Button'
import BasketModal from './Modals/BasketModal'
import { ActiveSupportedBasket } from '../../../bao/lib/types'

type ModalOperation = 'MINT' | 'REDEEM'

type BasketButtonsProps = {
	basket: ActiveSupportedBasket
}

const BasketButtons: React.FC<BasketButtonsProps> = ({ basket }) => {
	const [showBasketModal, setShowBasketModal] = useState(false)
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
			<Row lg={3} style={{ padding: '0 0.75rem', marginBottom: '25px' }}>
				<Col>
					<Button onClick={() => handleClick('MINT')}>Mint</Button>
				</Col>
				<Col>
					<Button onClick={() => handleClick('REDEEM')}>Redeem</Button>
				</Col>
				<Col>
					{/* TODO - Link to DEX with Basket LP */}
					<OverlayTrigger
						overlay={
							<Tooltip id="tooltip-disabled">
								There is currently insufficient liquidity on bSTBL pairs.
							</Tooltip>
						}
					>
						<span>
							<TempButton disabled style={{ pointerEvents: 'none' }}>
								Swap
							</TempButton>
						</span>
					</OverlayTrigger>
				</Col>
			</Row>
		</>
	)
}

export default BasketButtons
