import React from 'react'

import Container from '../Container'
import Nav from './components/Nav'

const Footer: React.FC = () => (
	<footer className='bottom-0 left-0 m-auto mb-8 w-full p-4'>
		<div className='flex flex-1 justify-center'>
			<Nav />
		</div>
	</footer>
)

export default Footer
