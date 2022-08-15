import IconLink from '@/components/IconLink'
import { faDiscord, faGithub, faMedium, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faBolt, faBook, faBug, faComments } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Tooltipped from '../../Tooltipped'

const Nav: React.FC = () => {
	return (
		<div className='flex items-center text-xl'>
			<Tooltipped content='Discord' placement='top'>
				<IconLink href='https://discord.gg/BW3P62vJXT' label='Discord' icon={faDiscord} />
			</Tooltipped>
			<Tooltipped content='Twitter' placement='top'>
				<IconLink href='https://twitter.com/BaoCommunity' label='Twitter' icon={faTwitter} />
			</Tooltipped>
			<Tooltipped content='Medium' placement='top'>
				<IconLink href='https://medium.com/baomunity' label='Medium' icon={faMedium} />
			</Tooltipped>
			<Tooltipped content='Governance Forum' placement='top'>
				<IconLink href='https://gov.bao.finance/' label='Governance Forum' icon={faComments} />
			</Tooltipped>
			<Tooltipped content='Snapshot' placement='top'>
				<IconLink href='https://snapshot.page/#/baovotes.eth' label='Snapshot' icon={faBolt} />
			</Tooltipped>
			<Tooltipped content='Documentation' placement='top'>
				<IconLink href='https://docs.bao.finance/' label='Documentation' icon={faBook} />
			</Tooltipped>
			<Tooltipped content='GitHub' placement='top'>
				<IconLink href='https://github.com/baofinance' label='GitHub' icon={faGithub} />
			</Tooltipped>
			<Tooltipped content='Bug Bounty Program' placement='top'>
				<IconLink href='https://www.immunefi.com/bounty/baofinance' label='Bug Bounty Program' icon={faBug} />
			</Tooltipped>
		</div>
	)
}

export default Nav
