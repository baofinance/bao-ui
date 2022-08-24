import Head from 'next/head'
import React from 'react'

export default function Dashboard() {
	return (
		<div className='py-4 md:py-8 lg:py-12 max-w-7xl mx-auto sm:px-6 lg:px-8'>
			<Head>
				<title>Bao | Dashboard</title>
				<meta name='description' content='Bao' />
				<meta key='twitter:description' name='twitter:description' content='Bao' />
				<meta key='og:description' property='og:description' content='Bao' />
			</Head>
		</div>
	)
}
