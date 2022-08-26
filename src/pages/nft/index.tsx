import { useWeb3React } from '@web3-react/core'
import Image from 'next/image'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'

import { ActiveSupportedNFT } from '@/bao/lib/types'
import { mintNFT } from '@/bao/utils'
import Button from '@/components/Button/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useClaimedCheck } from '@/hooks/nft/useClaimedCheck'
import useNFTs from '@/hooks/nft/useNFTs'

const NFT: React.FC = () => {
	const nfts = useNFTs()

	return (
		<>
			<NextSeo title={'NFT'} description={'Check your eligibility and claim your NFT here!'} />
			<PageHeader title='NFT' description='Check your eligibility and claim your NFT here!' />
			<div className={`flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-4'} m-auto w-fit`}>
				{nfts && nfts.map(nft => <NFTItem nft={nft} key={nft.nid} />)}
			</div>
		</>
	)
}

type NFTItemProps = {
	nft: ActiveSupportedNFT
}

const NFTItem: React.FC<NFTItemProps> = ({ nft }) => {
	const { account } = useWeb3React()
	const { handleTx } = useTransactionHandler()
	const isClaimed = useClaimedCheck(nft.nftAddress)
	const whitelist = require(`@/bao/lib/whitelist/${nft.whitelist}`)

	return (
		<Card>
			<Card.Header header={nft.name} subheader={nft.description} />
			<Card.Body>
				<Image src={nft.image} width={300} height={300} alt={nft.name} className='rounded-lg border border-primary-300' />
			</Card.Body>
			<Card.Actions>
				<>
					{!account ? (
						<Button fullWidth disabled={true}>
							Claim
						</Button>
					) : typeof account === 'string' ? (
						whitelist.default.includes(account.toLowerCase()) ? (
							!isClaimed ? (
								<Button
									onClick={async () => {
										handleTx(mintNFT(nft.whitelist, nft.nftContract, account), `Claim ${nft.name}`)
									}}
								>
									Claim
								</Button>
							) : (
								<Button fullWidth disabled={true}>
									Already Claimed
								</Button>
							)
						) : (
							<Button fullWidth disabled={true}>
								Not Eligible
							</Button>
						)
					) : (
						<Button fullWidth disabled={true}>
							Checking Eligibility...
						</Button>
					)}
					<div className='mt-2' />
					{isClaimed ? (
						<Button
							href={`https://opensea.io/${account}?search[sortBy]=LISTING_DATE&search[query]=${nft.opensea}`}
							fullWidth
							text='View on OpenSea'
						/>
					) : (
						<Button fullWidth disabled={true} text='View on OpenSea' />
					)}
				</>
			</Card.Actions>
		</Card>
	)
}

export default NFT
