import React from 'react'
import styled from 'styled-components'

export const HrText = ({ content }: HrTextProps) => {
	return (
		<HrContainer>
			<hr className="hr-text" data-content={content} />
		</HrContainer>
	)
}

type HrTextProps = {
	content: string
}

const HrContainer = styled.div`
	.hr-text {
		line-height: 1em;
		position: relative;
		outline: 0;
		border: 0;
		color: transparent;
		text-align: center;
		height: 1.5em;
		opacity: 0.85;

		&:before {
			content: '';
			background: linear-gradient(
				to right,
				transparent,
				${(props) => props.theme.color.text[100]},
				transparent
			);
			position: absolute;
			left: 0;
			top: 50%;
			width: 100%;
			height: 1px;
		}
		&:after {
			content: attr(data-content);
			position: relative;
			display: inline-block;
			font-family: 'Rubik', sans-serif;
			font-size: 24px;
			vertical-align: middle;

			padding: 0 0.5em;
			line-height: 1em;
			color: ${(props) => props.theme.color.text[100]};
			background-color: ${(props) => props.theme.color.background[100]};
		}
	}
`
