import Modal from '@/components/Modal'
import React, { useCallback } from 'react'

interface FeeModalProps {
	show: boolean
	onHide: () => void
}

export const FeeModal: React.FC<FeeModalProps> = ({ show, onHide }) => {
	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header header='Vote on Gauges' onClose={hideModal} />
			<Modal.Body>Placeholder</Modal.Body>
		</Modal>
	)
}

export default FeeModal
