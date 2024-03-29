/* eslint-disable react/no-unescaped-entities */
import PageHeader from '@/components/PageHeader'
import 'katex/dist/katex.min.css'
import { NextSeo } from 'next-seo'
import 'rc-slider/assets/index.css'
import React from 'react'
import Locked from './components/Locked'

const Distribution: React.FC = () => {
	return (
		<>
			<NextSeo title={`Distribution`} description={`Migrate your BAOv1 to BAOv2!`} />
			<PageHeader title='Distribution' />
			<Locked />
		</>
	)
}

export default Distribution
