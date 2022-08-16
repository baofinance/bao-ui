import { ActiveSupportedNFT, BaoNFT } from '@/bao/lib/types'
import { getNFTContract, mintNFT } from '@/bao/utils'
import { Button } from '@/components/Button/Button'
import Label from '@/components/Label'
import Page from '@/components/Page'
import PageHeader from '@/components/PageHeader'
import useBao from '@/hooks/base/useBao'
import useNFTs from '@/hooks/nft/useNFTs'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useClaimedCheck } from '@/hooks/nft/useMint'
import { useWeb3React } from '@web3-react/core'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'

type NFTItemProps = {
	nft: ActiveSupportedNFT
}

const NFT: React.FC = () => {
	const nfts = useNFTs()

	console.log(nfts)
	return (
		<>
			<NextSeo title={'NFT'} description={'Check your eligibility and claim your BaoNFT here!'} />
			<Page>
				<PageHeader title='NFT' description='Check your eligibility and claim your BaoNFT here!' />
				<Row md='auto' className='justify-content-md-center'>
					{nfts && nfts.map(nft => <NFTItem nft={nft} key={nft.nid} />)}
				</Row>
			</Page>
		</>
	)
}

export default NFT

const NFTItem: React.FC<NFTItemProps> = ({ nft }) => {
	const { account } = useWeb3React()
	const bao = useBao()
	const { handleTx } = useTransactionHandler()
	const isClaimed = useClaimedCheck(nft)

	return (
		<Col style={{ marginBottom: '12px' }}>
			<Card>
				<Card.Header>
					<Label text={nft.name} />
				</Card.Header>
				<Card.Body>
					<Image src={nft.image} width={320} height={300} alt={nft.name} className='rounder-lg' />
				</Card.Body>
				<Card.Footer>
					<>
						{!account ? (
							<Button fullWidth disabled={true}>
								Claim
							</Button>
						) : typeof account === 'string' ? (
							nft.whitelist.includes(account.toLowerCase()) ? (
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
				</Card.Footer>
			</Card>
		</Col>
	)
}
