import { faExclamation, faExclamationCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styled from 'styled-components'

const AnnouncementBar: React.FC = () => (
	<div className='alert alert-danger alert-dismissible fade show announcement-top-bar' role='alert'>
		<StyledTitle>
			<FontAwesomeIcon icon={faExclamationCircle} color='red' size='lg' />
			{'  '}
			Harvest your BAO rewards before Nov 19th. Locked balances will be snapshotted at that time and unharvested BAO will NOT be included.
			{'  '}
			<FontAwesomeIcon icon={faExclamationCircle} color='red' size='lg' />
		</StyledTitle>
	</div>
)

export default AnnouncementBar

export const StyledTitle = styled.h1`
	font-family: 'Rubik', sans-serif;
	font-size: 1.2rem !important;
	text-align: center;
	font-weight: ${props => props.theme.fontWeight.medium} !important;
	color: ${props => props.theme.color.red};

	@keyframes bounce {
		to {
			background-position: 300%;
		}
	}
`
