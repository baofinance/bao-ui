/* eslint-disable react/no-unescaped-entities */
import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import Swapper from './components/LiquidSwap'

const Distribution: React.FC = () => {
	return (
		<>
			<NextSeo title={`Distribution`} description={`Migrate your BAOv1 to BAOv2!`} />
			<PageHeader title='Distribution' />
			<Swapper />
		</>
	)
}

export default Distribution
