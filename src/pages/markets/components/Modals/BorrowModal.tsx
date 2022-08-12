import React from 'react'
import MarketModal, { MarketModalProps, MarketOperations } from './Modals'

const MarketBorrowModal = ({ show, onHide, asset }: MarketModalProps) => (
	<MarketModal operations={[MarketOperations.mint, MarketOperations.repay]} asset={asset} show={show} onHide={onHide} />
)

export default MarketBorrowModal
