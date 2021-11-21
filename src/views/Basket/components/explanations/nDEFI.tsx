import React from 'react'
import { BasketBoxHeader, BasketExplanation, BasketHeader, BasketList, BasketSubHeader } from '../styles'

const nDEFI: React.FC = () => (
	<>
			<BasketHeader>Product Description</BasketHeader>
			<p>
				The Bao DeFi Basket is divided into key DeFi sectors, which are given a
				weighting reflecting their maturity and share of the overall market.
				Within those sectors, each project is weighted on the TVL divided by
				Fully Diluted Valuation (FDV).
			</p>

			<BasketHeader>Objective</BasketHeader>
			<p>
				To generate revenue a defi project needs value deposited into their
				contracts. This makes Total Value Locked (TVL) a key metric for
				evaluating a project's ability to generate revenue. Projects with a high
				TVL are also likely to gain more traction in the market through the
				network effects the existing capital provides - capital attracts more
				capital. A good example of this is with Yearn Finance. Yearn was able to
				generate massive amounts of revenue as a result of the large amount of
				capital they attracted. This gave them the resources to further develop
				and innovate their products in a positive feedback loop. Yearn’s success
				has led to many projects such as Alchemix and Abracadabra using their
				products and liquidity as a base layer to build on.
			</p>
			<p>
				nDEFI is composed of the strongest components in the DeFi ecosystem,
				striving to provide core coverage of the key building blocks for the
				future of finance. With nDEFI you’ll have exposure to infrastructure,
				lending markets, decentralized exchanges, synthetics, and yield
				aggregators. The unique weighting formula allows the basket to invest in
				projects gaining traction earlier and with a greater weighting than
				market cap weighted baskets.
			</p>
			<p>
				The Bao DeFi Basket will provide the crypto industry's first automated
				value investing, decentralized, tokenized portfolios. When you add the
				prospect of the underlying tokens being put to work to earn yield.
			</p>

			<BasketHeader>Criteria</BasketHeader>
			<p>
				For a project to be included in the Bao Defi Basket, it must fit the
				below criteria in order to reduce the risk of the basket and fit the
				desires of the community.
			</p>
			<BasketSubHeader>Characteristics</BasketSubHeader>
			<BasketList>
				<li>Be a DeFi project available on the Ethereum blockchain.</li>
				<li>Listed on DefiLlama</li>
				<li>
					Have at least 7.5% of the total supply in circulation and have a
					predictable token emission over the next 5 years.
				</li>
				<li>
					The protocols will be selected by TVL based on DeFiLlama’s website.
				</li>
				<li>
					The protocol must be running for 3 months before qualifying to be
					included in the basket.
				</li>
				<li>
					In the event of a safety incident, the team must have addressed the
					problem responsibly and promptly, providing users of the protocol a
					reliable solution and document a detailed, transparent breakdown of
					the incident.
				</li>
				<li>Be Ethereum-focused</li>
				<li>Must be sufficiently decentralised</li>
			</BasketList>

			<BasketHeader>Strategy</BasketHeader>
			<p>
				It is possible for the underlying tokens to utilize strategies that will
				earn yield, maximising value for basket holders, who benefit from this
				productivity without having to perform any actions themselves. These
				strategies will be changed over time to take advantage of new
				opportunities or to maximise the yield earned.
			</p>

			<BasketHeader>Management</BasketHeader>
			<p>The Basket is maintained quarterly in two phases.</p>

			<p>
				<BasketSubHeader>Determination Phase</BasketSubHeader>
			</p>
			<p>
				The determination phase takes place during the final 2 weeks of the
				quarter. During this phase the changes needed for the next
				reconstitution are determined.
			</p>
			<p>
				The TVL and FDV of each project are recorded, including new projects
				that qualify for the basket and meet the criteria.
			</p>
			<p>
				Proposed changes will be published on the governance forum for 1 week
				then a governance vote will run for the community to approve changes.
			</p>
			<p>
				<BasketSubHeader>Reconstitution Phase</BasketSubHeader>
			</p>
			<p>
				In the two weeks following a successful vote, the basket components will
				be adjusted as per the instructions published during the final 2 weeks
				of the quarter.
			</p>
	</>
)

export default nDEFI
