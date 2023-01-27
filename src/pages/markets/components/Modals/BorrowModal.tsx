import React from 'react'

import MarketModal, { MarketModalProps, MarketOperations } from './Modals'

const MarketBorrowModal = ({ show, onHide, asset, marketName }: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.mint, MarketOperations.repay]}
		asset={asset}
		show={show}
		onHide={onHide}
		marketName={marketName}
	/>
)

export default MarketBorrowModal
