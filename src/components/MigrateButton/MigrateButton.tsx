import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'
import Button from '../Button'

interface AccountButtonProps {}

const MigrateButton: React.FC<AccountButtonProps> = () => {
	return (
		<>
			<div className='w-[calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3)] relative mr-4 flex'>
				<div className='bg-rainbow animate-rainbow-light' />
				<Link href='/migrate'>
					<Button size='sm'>
						Swap BAOv1 <FontAwesomeIcon icon={faSync} className='mx-1 font-semibold' /> BAOv2!
					</Button>
				</Link>
			</div>
		</>
	)
}

export default MigrateButton
