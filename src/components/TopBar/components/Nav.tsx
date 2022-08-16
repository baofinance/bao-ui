import NavLink from '@/components/NavLink'
import React from 'react'

const Nav: React.FC = () => {
	const navigation = [
		{ name: 'Markets', href: '/markets' },
		{ name: 'Ballast', href: '/ballast' },
		{ name: 'Baskets', href: '/baskets' },
		{ name: 'Farms', href: '/farms' },
		{ name: 'NFT', href: '/nft' },
	]

	const externalLinks = [
		{ name: 'Vote', href: 'https://snapshot.page/#/baovotes.eth' },
		{ name: 'Forum', href: 'https://gov.bao.finance' },
		{ name: 'Docs', href: 'https://docs.bao.finance' },
	]

	return (
		<nav className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' aria-label='Top'>
			<div className='border-indigo-500 flex w-full items-center justify-between border-b py-6 lg:border-none'>
				<div className='flex items-center'>
					<div className='ml-10 hidden space-x-8 lg:block'>
						{navigation.map(link => (
							<NavLink href={link.href} key={link.name}>
								{link.name}
							</NavLink>
						))}
						{externalLinks.map(link => (
							<a
								href={link.href}
								key={link.name}
								target='_blank'
								rel='noreferrer'
								className='text-rubik font-medium text-text-100 antialiased hover:text-text-400'
							>
								{link.name}
							</a>
						))}
					</div>
				</div>
			</div>
			<div className='flex flex-wrap justify-center space-x-6 py-4 lg:hidden'>
				{navigation.map(link => (
					<NavLink href={link.href} key={link.name}>
						{link.name}
					</NavLink>
				))}
				{externalLinks.map(link => (
					<a
						href={link.href}
						key={link.name}
						target='_blank'
						rel='noreferrer'
						className='text-rubik font-medium text-text-100 antialiased hover:text-text-300'
					>
						{link.name}
					</a>
				))}
			</div>
		</nav>
	)
}

export default Nav
