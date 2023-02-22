import React from 'react'

import MarketModal, { MarketModalProps, MarketOperations } from './Modals'

export const MarketSupplyModal = ({ show, onHide, asset, marketName }: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.supply, MarketOperations.withdraw]}
		asset={asset}
		show={show}
		onHide={onHide}
		marketName={marketName}
	/>
)

export default MarketSupplyModal
