import React from 'react'
import styled from 'styled-components'
import Nav from './components/Nav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltipped from '../Tooltipped'

const Footer: React.FC = () => (
	<StyledFooter>
		<div
			style={{
				margin: '0 auto',
				width: '50%',
				textAlign: 'center',
				fontFamily: 'Rubik',
				fontSize: '16px',
				marginBottom: '5px',
			}}
		>
			Powered by{' '}
			<img
				src="/LINK.png"
				style={{
					height: '1em',
					display: 'inline',
				}}
			/>{' '}
			<a href="https://chain.link/">ChainLink</a> and coffee. Made with{' '}
			<FontAwesomeIcon icon="heart" style={{ color: '#c02969' }} /> by{' '}
			<Tooltipped content={<><FontAwesomeIcon icon={['fab', 'discord']} /> vex#9406</>} placement="top">
				<a href="https://twitter.com/vex_0x">vex</a>
			</Tooltipped>
		</div>
		<StyledFooterInner>
			<StyledNavWrapper>
				<Nav />
			</StyledNavWrapper>
		</StyledFooterInner>
	</StyledFooter>
)

const StyledFooter = styled.footer`
	margin-top: ${(props) => props.theme.spacing[4]}px;
	margin: auto;
	padding: ${(props) => props.theme.spacing[4]}px;
`
const StyledFooterInner = styled.div`
	margin: auto;
	align-items: center;
	display: flex;
	height: ${(props) => props.theme.topBarSize}px;
	justify-content: space-between;
	max-width: ${(props) => props.theme.siteWidth}px;
	width: 100%;
	margin-bottom: -${(props) => props.theme.spacing[3]}px;
`

const StyledNavWrapper = styled.div`
	display: flex;
	flex: 1;
	justify-content: center;
`

export default Footer
