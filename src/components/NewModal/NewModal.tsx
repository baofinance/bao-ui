import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { CloseButton } from 'views/Nest/components/styles'

export interface NewModalProps {
	onDismiss?: () => void
	header?: React.ReactNode
	children?: React.ReactNode
	footer?: React.ReactNode
}

export const NewModal = ({ header, children, footer }: NewModalProps) => (
	<ModalContainer>
		<ModalContent>
			<ModalHeader>{header}</ModalHeader>
			<ModalBody>{children}</ModalBody>
			<ModalFooter>{footer}</ModalFooter>
		</ModalContent>
	</ModalContainer>
)

const ModalContainer = styled.div`
	display: flex;
	width: 100vw;
	height: 100vh;
	position: fixed;
	left: 0px;
	top: 0px;
	z-index: 1400;
	justify-content: center;
	align-items: flex-start;
	overflow: auto;
`

const ModalContent = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
	outline-offset: 2px;
	color: ${(props) => props.theme.color.text[100]};
	z-index: 1400;
	box-shadow: ${(props) => props.theme.boxShadow.default};
	max-width: 28rem;
    background: ${(props) => props.theme.color.primary[100]};
	outline: transparent solid 2px;
	border-radius: 0.375rem;
	margin: 8rem;
`

const ModalHeader = styled.div`
	flex: 0 1 0%;
	padding-inline-start: 1.5rem;
	padding-inline-end: 1.5rem;
	padding-top: 1rem;
	padding-bottom: 1rem;
	font-size: 1.25rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	border-bottom-width: 2px;
	border-bottom-color: #100e21;
`

const ModalBody = styled.div`
	padding-inline-start: 1.5rem;
	padding-inline-end: 1.5rem;
	flex: 1 1 0%;
	padding: 0px;
`

const ModalFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-inline-start: 1.5rem;
	padding-inline-end: 1.5rem;
	padding-top: 1rem;
	padding-bottom: 1rem;
`

export default NewModal
