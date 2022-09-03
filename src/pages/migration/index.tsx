import Typography from '@/components/Typography'
import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import MigrationSwapper from './components/MigrationSwapper'
import { AbsoluteContainer } from '@/components/Container'

const Migration: React.FC = () => {
	return (
		<>
			<NextSeo title={`Migration`} description={`Migrate your BAOv1 to BAOv2!`} />
			{isDesktop ? (
				<AbsoluteContainer>
					<MigrationSwapper />
				</AbsoluteContainer>
			) : (
				<MigrationSwapper />
			)}
		</>
	)
}

export default Migration
