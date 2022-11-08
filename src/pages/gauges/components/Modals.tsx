import { ActiveSupportedGauge } from '@/bao/lib/types'
import { NavButtons } from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import Image from 'next/future/image'
import React, { useCallback, useState } from 'react'
import Actions from './Actions'

type GaugeModalProps = {
	gauge: ActiveSupportedGauge
	show: boolean
	onHide: () => void
}

const GaugeModal: React.FC<GaugeModalProps> = ({ gauge, show, onHide }) => {
	const operations = ['Stake', 'Unstake', 'Vote', 'Rewards']
	const [operation, setOperation] = useState(operations[0])
	const gaugeInfo = useGaugeInfo(gauge)

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	console.log('Gauge Info', gaugeInfo)

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header
				onClose={hideModal}
				header={
					<>
						<Typography variant='xl' className='mr-1 inline-block font-semibold'>
							{operation}
						</Typography>
						{operation !== 'Rewards' ? (
							<>
								<Image className='z-10 inline-block select-none duration-200' src={gauge.iconA} width={32} height={32} alt={gauge.name} />
								{gauge.iconB !== null && (
									<Image
										className='z-20 -ml-2 inline-block select-none duration-200'
										width={32}
										height={32}
										src={gauge.iconB}
										alt={gauge.name}
									/>
								)}
							</>
						) : (
							<Image
								className='z-10 inline-block select-none duration-200'
								src='/images/tokens/BAO.png'
								width={32}
								height={32}
								alt={gauge.name}
							/>
						)}
					</>
				}
			/>
			<Modal.Options>
				<NavButtons options={operations} active={operation} onClick={setOperation} />
			</Modal.Options>
			<Actions gauge={gauge} onHide={onHide} operation={operation} />
		</Modal>
	)
}

export default GaugeModal
