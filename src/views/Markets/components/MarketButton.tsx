import { MarketOperations } from './Modals'
import styled from 'styled-components'
import React from 'react'

type MarketButtonProps = {
	operation: MarketOperations
	onDismiss: () => void
}

export const MarketButton = ({ operation, onDismiss }: MarketButtonProps) => {
	switch (operation) {
		case MarketOperations.supply:
			return (
				<ButtonStack>
					<SubmitButton onClick={onDismiss}>Supply</SubmitButton>
				</ButtonStack>
			)

		case MarketOperations.withdraw:
			return (
				<ButtonStack>
					<SubmitButton onClick={onDismiss}>Withdraw</SubmitButton>
				</ButtonStack>
			)

		case MarketOperations.borrow:
			return <SubmitButton onClick={onDismiss}>Borrow</SubmitButton>

		case MarketOperations.repay:
			return (
				<ButtonStack>
					<SubmitButton onClick={onDismiss}>Repay</SubmitButton>
				</ButtonStack>
			)
	}
}

const ButtonStack = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`

const SubmitButton = styled.button`
    display: inline-flex;
    appearance: none;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: relative;
    white-space: nowrap;
    vertical-align: middle;
    outline-offset: 2px;
    width: 100%;
    line-height: 1.2;
    font-weight: ${(props) => props.theme.fontWeight.medium};
    transition-property: all;
    transition-duration: 200ms;
    height: 2.5rem;
    min-width: 2.5rem;
    font-size: 13px;
    padding-inline-start: 1rem;
    padding-inline-end: 1rem;
	border: none;
	border-bottom: 1px solid ${(props) => props.theme.color.primary[400]};
	box-shadow: ${(props) => props.theme.boxShadow.default};
    background-color: ${(props) => props.theme.color.primary[200]};
    text-transform: uppercase;
    outline: transparent solid 2px;
    border-radius: .375rem;
    color: ${(props) => props.theme.color.text[100]};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	position: relative;
	transition: .6s;
	overflow: hidden;

    &:focus {
		outline: 0;
	}

	&:before{
		content: '';
		display: block;
		position: absolute;
		background: ${(props) => props.theme.color.transparent[300]};
		width: 60px;
		height: 100%;
		left: 0;
		top: 0;
		opacity: .5;
		filter: blur(30px);
		transform: translateX(-100px)  skewX(-15deg);
	  }
	  &:after{
		content: '';
		display: block;
		position: absolute;
		background: ${(props) => props.theme.color.transparent[200]};
		width: 30px;
		height: 100%;
		left: 30px;
		top: 0;
		opacity: 0;
		filter: blur(5px);
		transform: translateX(-100px) skewX(-15deg);
	  }
	  &:hover{
		background: ${(props) => props.theme.color.primary[100]};
		cursor: pointer;
		&:before{
		  transform: translateX(500px)  skewX(-15deg);  
		  opacity: 0.6;
		  transition: .7s;
		}
		&:after{
		  transform: translateX(500px) skewX(-15deg);  
		  opacity: 1;
		  transition: .7s;
		}
	  }
	}

	&:hover,
	&:focus,
	&:active {
		color: ${(props) => (!props.disabled ? props.color : `${props.color}`)};
		cursor: ${(props) =>
			props.disabled ? 'not-allowed' : 'pointer'} !important;
	}
}
`
