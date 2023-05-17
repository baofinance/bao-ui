import React from 'react'
import { PropagateLoader, PulseLoader } from 'react-spinners'

interface LoaderProps {
	text?: string
	block?: boolean
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
	return (
		<div className='inline items-center justify-center'>
			<PulseLoader size={6} speedMultiplier={0.8} color='#e21a53' />
			{text && <div className='text-baoWhite'>{text}</div>}
		</div>
	)
}

export default Loader

export const PageLoader: React.FC<LoaderProps> = ({ block, text }) => {
	return (
		<div className='mt-16 items-center justify-center text-center'>
			<PropagateLoader size={12} speedMultiplier={0.8} color='#e21a53' className={`${block && 'm-auto block'}`} />
			{text && <div className='text-baoWhite'>{text}</div>}
		</div>
	)
}
