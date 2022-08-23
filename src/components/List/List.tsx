import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'

type ListHeaderProps = {
	headers: string[]
}

export const ListHeader: React.FC<ListHeaderProps> = ({ headers }: ListHeaderProps) => {
	return (
		<div className='container'>
			<div className='flex flex-row px-2 py-3'>
				{headers.map((header: string) => (
					<div className='flex w-full flex-col pb-0 text-center font-bold first:items-start last:items-end' key={header}>
						{header}
					</div>
				))}
			</div>
		</div>
	)
}

export const ListCol = styled(Col)`
	font-family: 'Rubik', sans-serif;
	font-weight: ${props => props.theme.fontWeight.strong};
	text-align: right;

	&:first-child {
		text-align: left;
	}

	&:nth-child(2) {
		text-align: center;
	}

	&:last-child {
		margin-right: 20px;
	}
`

export const ListItem = styled.button`
	background-color: transparent;
	border-color: transparent;
	width: 100%;
`

export const ListItemHeader = styled.div`
		background: ${props => props.theme.color.primary[100]};
		color: ${props => props.theme.color.text[100]};
		padding: 1.25rem;
		border: ${props => props.theme.border.default};
		border-radius: 8px;

		&:hover,
		&:focus,
		&:active {
			background: ${props => props.theme.color.primary[200]};
			color: ${props => props.theme.color.text[100]};
			border: ${props => props.theme.border.default};
			box-shadow: none;
		}
		
		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}
			
			&:nth-child(2) {
				text-align: center;
			}

			&:last-child {
				text-align: right;
			}
		}
		
		&:active {
			border-radius: 8px 8px 0px 0px;
		}
	
		img {
			height: 32px;
			margin-right: 0.75rem;
		}
	}
`
