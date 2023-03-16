import React from 'react'

import VaultModal, { VaultModalProps, VaultOperations } from './Modals'

const VaultBorrowModal = ({ show, onHide, asset, vaultName }: VaultModalProps) => (
	<VaultModal operations={[VaultOperations.mint, VaultOperations.repay]} asset={asset} show={show} onHide={onHide} vaultName={vaultName} />
)

export default VaultBorrowModal
