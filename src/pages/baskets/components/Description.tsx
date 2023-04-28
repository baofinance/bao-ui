import React from 'react'
import { isDesktop } from 'react-device-detect'

import Config from '@/bao/lib/config'
import Typography from '@/components/Typography'

interface DescriptionProps {
	basketAddress: string
}

const Description: React.FC<DescriptionProps> = ({ basketAddress = '' }) => {
	return (
		<>
			<div className='glassmorphic-card mt-4 p-8'>
				{basketAddress === Config.addressMap.bDEFI && <BDEFI />}
				{basketAddress === Config.addressMap.bSTBL && <BSTBL />}
				{basketAddress === Config.addressMap.bETH && <BETH />}
			</div>
		</>
	)
}

export default Description

const BDEFI: React.FC = () => (
	<>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Description
		</Typography>
		<Typography variant='p' className='my-4'>
			The Bao DeFi Basket is divided into key DeFi sectors, which are given a weighting reflecting their maturity and share of the overall
			market. Within those sectors, each project is weighted on the TVL divided by Fully Diluted Valuation (FDV).
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Objective
		</Typography>
		<Typography variant='p' className='my-4'>
			To generate revenue a defi project needs value deposited into their contracts. This makes Total Value Locked (TVL) a key metric for
			evaluating a project’s ability to generate revenue. Projects with a high TVL are also likely to gain more traction in the market
			through the network effects the existing capital provides - capital attracts more capital. A good example of this is with Yearn
			Finance. Yearn was able to generate massive amounts of revenue as a result of the large amount of capital they attracted. This gave
			them the resources to further develop and innovate their products in a positive feedback loop. Yearn’s success has led to many
			projects such as Alchemix and Abracadabra using their products and liquidity as a pp layer to build on.
		</Typography>
		<Typography variant='p' className='my-4'>
			bDEFI is composed of the strongest components in the DeFi ecosystem, striving to provide core coverage of the key building blocks for
			the future of finance. With bDEFI you’ll have exposure to infrastructure, lending markets, decentralized exchanges, synthetics, and
			yield aggregators. The unique weighting formula allows the basket to invest in projects gaining traction earlier and with a greater
			weighting than market cap weighted baskets.
		</Typography>
		<Typography variant='p' className='my-4'>
			The Bao DeFi Basket will provide the crypto industry’s first automated value investing, decentralized, tokenized portfolios. When you
			add the prospect of the underlying tokens being put to work to earn yield.
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Criteria
		</Typography>
		<Typography variant='p' className='my-4'>
			For a project to be included in the Bao Defi Basket, it must fit the below criteria in order to reduce the risk of the basket and fit
			the desires of the community.
		</Typography>
		<Typography variant='xl' className='my-4'>
			Characteristics
		</Typography>
		<ul className='ml-8 list-disc'>
			<li>Be a DeFi project available on the Ethereum blockchain.</li>
			<li>Listed on DefiLlama</li>
			<li>Have at least 7.5% of the total supply in circulation and have a predictable token emission over the next 5 years.</li>
			<li>The protocols will be selected by TVL based on DeFiLlama’s website.</li>
			<li>The protocol must be running for 3 months before qualifying to be included in the basket.</li>
			<li>
				In the event of a safety incident, the team must have addressed the problem responsibly and promptly, providing users of the
				protocol a reliable solution and document a detailed, transparent breakdown of the incident.
			</li>
			<li>Be Ethereum-focused</li>
			<li>Must be sufficiently decentralised</li>
		</ul>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Strategy
		</Typography>
		<Typography variant='p' className='my-4'>
			It is possible for the underlying tokens to utilize strategies that will earn yield, maximising value for basket holders, who benefit
			from this productivity without having to perform any actions themselves. These strategies will be changed over time to take advantage
			of new opportunities or to maximise the yield earned.
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Management
		</Typography>
		<Typography variant='p' className='my-4'>
			The Basket is maintained quarterly in two phases.
		</Typography>
		<Typography variant='xl' className='my-4'>
			Determination Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			The determination phase takes place during the final 2 weeks of the quarter. During this phase the changes needed for the next
			reconstitution are determined. The TVL and FDV of each project are recorded, including new projects that qualify for the basket and
			meet the criteria.
		</Typography>
		<Typography variant='p' className='my-4'>
			Proposed changes will be published on the governance forum for 1 week then a governance vote will run for the community to approve
			changes.
		</Typography>
		<Typography variant='xl' className='my-4'>
			Reconstitution Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			In the two weeks following a successful vote, the basket components will be adjusted as per the instructions published during the
			final 2 weeks of the quarter.
		</Typography>
	</>
)

const BSTBL: React.FC = () => (
	<>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Description
		</Typography>
		<Typography variant='p' className='my-4'>
			The Bao Stable Basket provides a way to diversify counterparty risk on stable assets while the underlying assets are put to work
			earning yield on various trusted yield farming protocols. Decentralized and non pegged stables will be used where yield is available.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Fees
		</Typography>
		<ul className='mb-4 ml-8 list-disc font-light'>
			<li>Entry Fee: 0%</li>
			<li>Streaming Fee: 0%</li>
			<li>Redemption Fee: 0%</li>
		</ul>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Objective
		</Typography>
		<Typography variant='p' className='my-4'>
			The objective of the Bao Stable Basket is to provide exposure to a diversified basket of stable coins with a focus on yield and
			decentralization.
		</Typography>
		<Typography variant='p' className='my-4'>
			By spreading risk over a number of coins, you reduce the impact of problems any single tokens face. Since the basket does not
			automatically rebalance, one stable losing its peg would not affect the other tokens in the basket.
		</Typography>
		<Typography variant='p' className='my-4'>
			By focusing on decentralized stables, you also reduce exposure to regulatory risk and do not rely on central issuers to continually
			act as they should.
		</Typography>
		<Typography variant='p' className='my-4'>
			The basket will start with a mixture of centrally issued and decentralized stable coins and deposit them in a variety of protocols to
			earn yield on them, swapping strategies regularly to maximize the yield earned.
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Criteria
		</Typography>
		<Typography variant='p' className='my-4'>
			For a project to be included in the Bao Stable basket, it must fit the below criteria in order to reduce the risk of the basket and
			fit the desires of the community.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Characteristics
		</Typography>
		<ul className='mb-4 ml-8 list-disc font-light'>
			<li>Be a stable token project available on the Ethereum blockchain.</li>
			<li>Be in liquid markets and being used in different lending protocols.</li>
			<li>The protocol must be running for 6 months before qulaifying to be included in the basket.</li>
			<li>
				In the event of a safety incident, the team must have addressed the problem responsibly and promptly, providing users of the
				protocol a reliable solution and document a detailed, transparent breakdown of the incident.
			</li>
			<li>Must be sufficiently decentralized and/or collateralized.</li>
		</ul>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Strategy
		</Typography>
		<Typography variant='p' className='my-4'>
			It is possible for the underlying tokens to utilize strategies that will earn yield, maximising value for basket holders, who benefit
			from this productivity without having to perform any actions themselves. These strategies will be changed over time to take advantage
			of new opportunities or to maximise the yield earned.
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Management
		</Typography>
		<Typography variant='p' className='my-4'>
			The Basket is maintained quarterly in two phases.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Determination Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			The determination phase takes place during the final 2 weeks of the quarter. During this phase the changes needed for the next
			reconstitution are determined. Strategies and allocation % will be revisited in order to reach the balance between decentralization
			and having the most optimal yet secure yield possible for those stables. Proposed changes will be published on the governance forum
			for 1 week then a governance vote will run for the community to approve changes.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Reconstitution Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			In the two weeks following a successful vote, the basket components will be adjusted as per the instructions published during the
			final 2 weeks of the quarter.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Emergency Maintenance
		</Typography>
		<Typography variant='p' className='my-4'>
			The multisig holders are authorized by the community to re-balance baskets outside the usual schedule during moments that they
			collectively deem to be critical emergencies. This clause will allow for quick re-balancing in the event of a protocol or basket being
			in danger of failing.
		</Typography>
		<Typography variant='p' className='my-4'>
			An example of when this would be utilized would be if a stable coin begins losing its peg/becoming insolvent, or a protocol suffers an
			exploit that is not dealt with sufficiently. These scenarios may be time sensitive and require immediate resolution. Thus the team may
			decide to act without warning and explain their actions in a governance forum post afterwards, or if there is deemed to be time, an
			emergency governance vote will be posted.
		</Typography>
		<Typography variant='p' className='my-4'>
			This is intended as a safety mechanism only, to prevent loss of users funds and as such would be a power exclusively exercised under
			extreme circumstances.
		</Typography>
	</>
)

const BETH: React.FC = () => (
	<>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Description
		</Typography>
		<Typography variant='p' className='my-4'>
			The Bao Ethereum Basket contains leading interest-bearing liquid-staked ETH tokens.
		</Typography>
		<Typography variant='p' className='my-4'>
			Tokens are weighted based on the cube root of their market cap to ensure the most liquid tokens have the largest weighting, making it
			ideal collateral while promoting a more even distribution between staking providers, helping to prevent any single provider from
			becoming dominant.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Fees
		</Typography>
		<ul className='mb-4 ml-8 list-disc font-light'>
			<li>Entry Fee: 0%</li>
			<li>Streaming Fee: 0.5%</li>
			<li>Redemption Fee: 0%</li>
		</ul>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Objective
		</Typography>
		<Typography variant='p' className='my-4'>
			The objective of the Bao Ethereum Basket is to provide exposure to a diversified basket of liquid-staked ETH tokens with a focus on
			yield and decentralization.{' '}
		</Typography>
		<Typography variant='p' className='my-4'>
			By spreading the risk over several tokens, you reduce the impact of problems any single tokens face.{' '}
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Characteristics
		</Typography>
		<ul className='mb-4 ml-8 list-disc font-light'>
			<li>Liquidity on ETH main net, with at least one supported pool allowing a $1m buy with less than 2% slippage.</li>
			<li>Operating for 3+ months.</li>
			<li>Chainlink price feed.</li>
			<li>Have wrapped tokens that compound staking rewards to minimize gas costs.</li>
			<li>Be non-custodial.</li>
		</ul>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Strategy
		</Typography>
		<Typography variant='p' className='my-4'>
			Liquid-staked ETH tokens earn a yield from staking returns. Additional strategies can be approved via governance.
		</Typography>
		<Typography variant='h3' className='mb-2 font-bakbak'>
			Management
		</Typography>
		<Typography variant='p' className='my-4'>
			The basket is maintained via governance at any time during three phases.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Determination Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			The determination phase begins when a concept is posted on the governance forum to rebalance the basket and takes place over two
			weeks. During the first week, the Bao community on the governance forum determines changes needed for the subsequent reconstitution to
			balance decentralization and optimal yet secure yield.
		</Typography>
		<Typography variant='p' className='my-4'>
			The suggested changes will be posted as a BIP on the governance forum during the second week.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Reconstitution Phase
		</Typography>
		<Typography variant='p' className='my-4'>
			The basket components will be adjusted per the instructions in the two weeks following a successful vote.
		</Typography>
		<Typography variant='xl' className='mb-2 font-bakbak'>
			Emergency Maintenance
		</Typography>
		<Typography variant='p' className='my-4'>
			The multisig holders are authorized by the community to re-balance baskets outside the usual schedule during moments that they
			collectively deem to be critical emergencies. This clause will allow for quick re-balancing in the event of a protocol or basket being
			in danger of failing.
		</Typography>
		<Typography variant='p' className='my-4'>
			The multisig holders have authorization from the community to rebalance baskets outside the usual schedule during moments that they
			collectively deem to be critical emergencies. This clause will allow for quick rebalancing if a protocol or basket is in danger of
			failing. These scenarios may be time sensitive and require immediate resolution. Thus the team may decide to act without warning and
			explain their actions in a governance forum post afterward, or if there is time, a multisig member will post an emergency governance
			vote.{' '}
		</Typography>
		<Typography variant='p' className='my-4'>
			Emergency maintenance is a safety mechanism only to prevent the loss of users` funds and, as such, would be a power exclusively
			exercised under extreme circumstances.
		</Typography>
	</>
)
