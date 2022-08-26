import Head from 'next/head'
import React from 'react'

export default function Dashboard() {
	return (
		<div className='mx-auto max-w-7xl py-4 sm:px-6 md:py-8 lg:py-12 lg:px-8'>
			<Head>
				<title>Bao | Dashboard</title>
				<meta name='description' content='Bao' />
				<meta key='twitter:description' name='twitter:description' content='Bao' />
				<meta key='og:description' property='og:description' content='Bao' />
			</Head>
		</div>
	)
}
