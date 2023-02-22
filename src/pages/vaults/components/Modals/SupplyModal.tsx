import VaultModal, { VaultModalProps, VaultOperations } from './Modals'

export const VaultSupplyModal = ({ show, onHide, asset, vaultName }: VaultModalProps) => (
	<VaultModal
		operations={[VaultOperations.supply, VaultOperations.withdraw]}
		asset={asset}
		show={show}
		onHide={onHide}
		vaultName={vaultName}
	/>
)

export default VaultSupplyModal
