import React from 'react'
import Container from '../Container'
import Nav from './components/Nav'

const Footer: React.FC = () => (
	<footer className='m-auto mt-4 p-4'>
		<Container className='m-auto mb-3 flex h-[72px] items-center'>
			<div className='flex flex-1 justify-center'>
				<Nav />
			</div>
		</Container>
	</footer>
)

export default Footer
