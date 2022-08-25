import React from 'react'
import { PulseLoader } from 'react-spinners'

interface LoaderProps {
	text?: string
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
	return (
		<div className='items-center justify-center inline'>
			<PulseLoader size={6} speedMultiplier={.8} color='#fff8ee' />
			{!!text && <div className='text-text-200'>{text}</div>}
		</div>
	)
}

export default Loader
