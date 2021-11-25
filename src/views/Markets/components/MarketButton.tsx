import { MarketOperations } from './Modals'
import styled from 'styled-components'
import React from 'react'
import { SupportedMarket } from 'bao/lib/types'
import BigNumber from 'bignumber.js'

type MarketButtonProps = {
	operation: MarketOperations
	asset: SupportedMarket
	val: BigNumber
	isDisabled: boolean
}

export const MarketButton = ({
	operation,
	asset,
	val,
	isDisabled,
}: MarketButtonProps) => {
	switch (operation) {
		case MarketOperations.supply:
			return (
				<ButtonStack>
					<SubmitButton disabled={isDisabled}>Supply</SubmitButton>
				</ButtonStack>
			)

		case MarketOperations.withdraw:
			return (
				<ButtonStack>
					<SubmitButton disabled={isDisabled}>Withdraw</SubmitButton>
				</ButtonStack>
			)

		case MarketOperations.borrow:
			return <SubmitButton disabled={isDisabled}>Borrow</SubmitButton>

		case MarketOperations.repay:
			return (
				<ButtonStack>
					<SubmitButton disabled={isDisabled}>Repay</SubmitButton>
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
    font-weight: ${(props) => props.theme.fontWeight.strong};
    transition-property: all;
    height: 50px;
    min-width: 2.5rem;
	font-size: ${(props) => props.theme.fontSize.default};
    padding-inline-start: 1rem;
    padding-inline-end: 1rem;
	border: none;
	border-bottom: 1px solid ${(props) => props.theme.color.primary[400]};
	box-shadow: ${(props) => props.theme.boxShadow.default};
    background-color: ${(props) => props.theme.color.primary[100]};
    outline: transparent solid 2px;
    border-radius: 8px;
    color: ${(props) => props.theme.color.text[100]};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	position: relative;
	transition: .5s;
	overflow: hidden;

    &:focus {
		outline: 0;
	}

	  &:hover{
		background: ${(props) => props.theme.color.primary[200]};
		box-shadow: ${(props) => props.theme.boxShadow.hover};
		cursor: pointer;
	  }
	}

	&:hover,
	&:focus,
	&:active {
		color: ${(props) => (!props.disabled ? props.color : `${props.color}`)};
		cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')} !important;
	}
`
