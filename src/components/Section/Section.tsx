import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

export const Section = ({
	label,
	description,
	href,
	right,
	image,
	noPadding,
	children,
}: {
	label?: React.ReactNode
	description?: React.ReactNode
	href?: string
	right?: React.ReactNode
	image?: React.ReactNode
	noPadding?: boolean
	children?: React.ReactNode
}) => {
	const title = (
		<Flex>
			{typeof label === 'string' ? <SectionTitle>{label}</SectionTitle> : label}
		</Flex>
	)

	const desc = (
		<Flex>
			{href ? (
				<SectionLink href={href}>
					{description}
				</SectionLink>
			) : typeof description === 'string' ? (
				<SectionDesc>
					{description}
				</SectionDesc>
			) : (
				description
			)}
		</Flex>
	)

	return (
		<SectionContainer>
			<SectionHeader>
				<HeaderContainer>
					{image}
					<HeaderText>
						{title}
						{desc}
					</HeaderText>
				</HeaderContainer>
				{right}
			</SectionHeader>
			<SectionContent>
				{children}
			</SectionContent>
		</SectionContainer>
	)
}

const Flex = styled.div`
	display: flex;
`

const SectionContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: ${(props) => props.theme.spacing[2]}px;
	padding-bottom: 0px;
	color: ${(props) => props.theme.color.text[100]};
`

const SectionHeader = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	min-height: 3.5rem;
	width: 100%;
`

const HeaderContainer = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
`

const HeaderText = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
`

const SectionTitle = styled.p`
	color: ${(props) => props.theme.color.text[100]};
	font-size: 1.25rem;
	font-weight: ${(props) => props.theme.fontWeight.strong};
    margin: 0;
`

const SectionLink = styled.a`
	transition-property: background-color, border-color, color, fill, stroke,
		opacity, box-shadow, transform;
	transition-duration: 150ms;
	transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	cursor: pointer;
	text-decoration: none;
	outline: 2px solid transparent;
	outline-offset: 2px;
	color: ${(props) => props.theme.color.text[300]};
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
    margin: 0;
`

const SectionDesc = styled.p`
	color: ${(props) => props.theme.color.text[200]};
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
    margin: 0;
`

const SectionContent = styled.div`
    display: block;
    width: 100%;
    margin-top: ${(props) => props.theme.spacing[2]}px;
	padding: ${(props) => props.theme.spacing[4]}px;
	background: ${(props) => props.theme.color.transparent[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
`

export default Section
