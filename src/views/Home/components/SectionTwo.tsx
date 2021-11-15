import dao from 'assets/img/dao.svg'
import diversify from 'assets/img/diversify.svg'
import passiveYield from 'assets/img/passive-yield.svg'
import React from 'react'
import styled from 'styled-components'
import { InfoHeader, InfoText } from './styles'

const SectionTwo: React.FC = () => (
	<>
		<InfoHeader>We're Building a Crosschain DeFi Ecosystem</InfoHeader>
		<InfoText>
			Bao is creating a multinetwork suite of applications that will provide
			services to DeFi users regardless of their preferred chains. We’ve already
			deployed our main project and franchised versions of it on xDai, Binance
			Smart Chain, and Polygon; with more planned in the future.
		</InfoText>

		<div style={{ marginTop: '3rem' }}></div>

		<InfoHeader>The Bao Vision</InfoHeader>
		<InfoText>
			Traditional finance doesn’t work. For too long it’s been serving the
			wealthy suits while erecting barriers of entry for everyone else. They own
			the data, restrict the tools, and change the rules to always be in their
			favor. It’s time to not only give that power back to the people, but to
			create even more powerful tools that the old cumbersome system could never
			dream of.
		</InfoText>

		<InfoText>
			At Bao Finance, we’re building a community composed of brilliant minds all
			seeking control of their own finances and building a new system that works
			for everyone. Synthetic assets allow us to create financial instruments
			and markets never seen before. If the data exists, so too can a
			marketplace for it - the possibilities are endless.
		</InfoText>

		<InfoText>
			It all comes down to data. Most people aren’t aware that financial data is
			what makes institutions so powerful and why you can’t do what they do.
			This is why synthetics will matter. If you can get liquidity in any
			discrete quantifiable event, what have you created? The world’s most
			accurate financial data system. Financial data is used within insurance,
			lending, hedge funds, risk mitigation, banking, yield, mortgages, credit
			scores, etc.
		</InfoText>

		<InfoText>
			Incentivised synthetics allow you to start building an open financial data
			market. Once you have synthetics, you own the financial data stream to
			anything because you can incentivise liquidity to make it more accurate.
			With this financial data stream you can start any DeFi business you want
			on top of it, or package and sell the data for others to build on. You
			become the foundation for the future of finance.
		</InfoText>

		<InfoHeader>Balancing, Automation, and Options</InfoHeader>
		<InfoText>
			Our community wants to build innovative products on top of this
			cutting-edge technology and create serious competition for the established
			giants – together. Goodbye Big Banks. <br />
			Hello BaoBanks.
		</InfoText>
	</>
)

const StyledSectionTitle = styled.h1`
	font-size: 48px;
	white-space: wrap;
	overflow-wrap: normal;
	max-width: 900px;
	margin-top: 3rem;
	font-weight: 600;
	pointer-events: none;
	white-space: wrap;
	overflow-wrap: normal;
	font-family: 'Kaushan Script';
	letter-spacing: -0.025em;
	text-align: center;

	@media (max-width: 960px) {
		width: 100%;
		font-size: 2rem;
		line-height: 2.5rem;
		max-width: 600px;
		margin-top: 4rem;
	}
	@media (max-width: 640px) {
		width: 100%;
		font-weight: 400;
		margin-top: 4rem;
		text-align: left;
	}
`

const StyledBody = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding-bottom: 12rem;
	margin-bottom: 4rem;
	border-bottom: 1px solid ${({ theme }) => theme.colors.grey2};
	@media (max-width: 960px) {
		margin-bottom: 0;
		padding: 2rem;
		padding-bottom: 8rem;
	}
`

const StyledBodySubText = styled.h3`
	max-width: 960px;
	text-align: center;
	line-height: 160%;
	font-size: 1.25rem;
	@media (max-width: 640px) {
		text-align: left;
	}
`

const StyledBodyParagraph = styled.h3`
	max-width: 960px;
	text-align: left;
	line-height: 160%;
	font-size: 1.25rem;
	@media (max-width: 640px) {
		text-align: left;
	}
`

export default SectionTwo
