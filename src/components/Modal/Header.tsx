import { faArrowLeft, faClose } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, ReactNode } from 'react'

import Typography from '@/components/Typography'


export interface ModalHeaderProps {
	header: string | ReactNode
	subheader?: string
	onClose?(): void
	onBack?(): void
}

const ModalHeader: FC<ModalHeaderProps> = ({ header, subheader, onBack, onClose }) => {
	return (
		<div className='flex items-start justify-between'>
			<div className='flex flex-col justify-center gap-1'>
				<Typography weight={700} className='text-high-emphesis flex items-center gap-3'>
					{onBack && (
						<FontAwesomeIcon icon={faArrowLeft} onClick={onBack} width={24} height={24} className='text-high-emphesis cursor-pointer' />
					)}
					{header}
				</Typography>
				{subheader && <Typography variant='sm'>{subheader}</Typography>}
			</div>
			{onClose && (
				<div className='flex h-6 w-6 cursor-pointer items-center justify-center' onClick={onClose}>
					<FontAwesomeIcon icon={faClose} width={24} height={24} className='text-high-emphesis' />
				</div>
			)}
		</div>
	)
}

export default ModalHeader
