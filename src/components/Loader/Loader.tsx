import React from 'react'
import { Spinner } from 'react-bootstrap'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

interface SpinnerProps {
	block?: boolean
}

export const SpinnerLoader: React.FC<SpinnerProps> = ({ block }) => {
	let style: any = {
		color: `#ad9485`,
	}
	if (block)
		style = {
			...style,
			display: 'block',
			margin: 'auto',
		}

	return <Spinner animation="grow" size="sm" style={style} />
}