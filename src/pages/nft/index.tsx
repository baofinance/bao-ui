import Config from '@/bao/lib/config'
import { getBaoSwapContract, getElderContract, mintBaoSwap, mintElder } from '@/bao/utils'
import { Button, SubmitButton } from '@/components/Button/Button'
import Label from '@/components/Label'
import Spacer from '@/components/Spacer'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useBaoSwapClaimedCheck, useElderClaimedCheck } from '@/hooks/nft/useMint'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import baoElderWL from './components/baoElderWL'
import baoSwapWL from './components/baoSwapWL'
import { StyledInfo } from './components/styles'

const NFT: React.FC = () => {
	const { account } = useWeb3React()
	const bao = useBao()
	const isElderClaimed = useElderClaimedCheck()
	const isBaoSwapClaimed = useBaoSwapClaimedCheck()
	const { pendingTx, handleTx } = useTransactionHandler()
	const elderContract = getElderContract(bao)
	const baoSwapContract = getBaoSwapContract(bao)

	return (
		<>
			<NextSeo title={'NFT'} description={'Check your eligibility and claim your BaoNFT here!'} />
			<div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
				<h1 className='font-kaushan text-xxxl antialiased font-strong text-center tracking-tighter text-text-dark-100'>NFT</h1>
					<StyledInfo>
						<div
							style={{
								alignItems: 'center',
								display: 'flex',
								flex: 1,
								justifyContent: 'center',
							}}
						>
							Check your eligibility and claim your BaoNFT here!
						</div>
					</StyledInfo>
					<Spacer size='md' />
					<Row md='auto' className='justify-content-md-center'>
						<Col style={{ marginBottom: '12px' }}>
							<Card>
								<Card.Header>
									<Label text='BaoElder NFT' />
								</Card.Header>
								<Card.Body>
									<Image src='/images/nft/baoelder.png' width={320} height={300} alt='' style={{ borderRadius: '8px' }} />
								</Card.Body>
								<Card.Footer>
									<>
										{pendingTx ? (
											<SubmitButton disabled={true}>
												{typeof pendingTx === 'string' ? (
													<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer'>
														<a>
															Pending Transaction
															<FontAwesomeIcon icon={faExternalLinkAlt} />
														</a>
													</Link>
												) : (
													'Pending Transaction'
												)}
											</SubmitButton>
										) : !account ? (
											<SubmitButton disabled={true}>Claim</SubmitButton>
										) : typeof account === 'string' ? (
											baoElderWL.includes(account.toLowerCase()) ? (
												!isElderClaimed ? (
													<SubmitButton
														onClick={async () => {
															handleTx(mintElder(elderContract, account), `Claim Bao Elder NFT`)
														}}
													>
														Claim
													</SubmitButton>
												) : (
													<SubmitButton disabled={true}>Already Claimed</SubmitButton>
												)
											) : (
												<SubmitButton disabled={true}>Not Eligible</SubmitButton>
											)
										) : (
											<SubmitButton disabled={true}>Checking Eligibility...</SubmitButton>
										)}
										<Link
											href={`https://opensea.io/${account}?search[sortBy]=LISTING_DATE&search[query]=BaoElder`}
											target='_blank'
											rel='noreferrer'
										>
											{isElderClaimed ? <Button text='View on OpenSea' /> : <Button disabled={true} text='View on OpenSea' />}
										</Link>
									</>
								</Card.Footer>
							</Card>
						</Col>
						<Col>
							<Card>
								<Card.Header>
									<Label text='BaoSwap NFT' />
								</Card.Header>
								<Card.Body>
									<Image src='/images/nft/baoswap.png' width={320} height={300} alt='' style={{ borderRadius: '8px' }} />
								</Card.Body>
								<Card.Footer>
									<>
										{pendingTx ? (
											<SubmitButton disabled={true}>
												{typeof pendingTx === 'string' ? (
													<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer'>
														<a>
															Pending Transaction
															<FontAwesomeIcon icon={faExternalLinkAlt} />
														</a>
													</Link>
												) : (
													'Pending Transaction'
												)}
											</SubmitButton>
										) : !account ? (
											<SubmitButton disabled={true}>Claim</SubmitButton>
										) : typeof account === 'string' ? (
											baoSwapWL.includes(account.toLowerCase()) ? (
												!isBaoSwapClaimed ? (
													<SubmitButton
														onClick={async () => {
															handleTx(mintBaoSwap(baoSwapContract, account), `Claim BaoSwap NFT`)
														}}
													>
														Claim
													</SubmitButton>
												) : (
													<SubmitButton disabled={true}>Already Claimed</SubmitButton>
												)
											) : (
												<SubmitButton disabled={true}>Not Eligible</SubmitButton>
											)
										) : (
											<SubmitButton disabled={true}>Checking Eligibility...</SubmitButton>
										)}
										<Link
											href={`https://opensea.io/${account}?search[sortBy]=LISTING_DATE&search[query]=BaoGnosis`}
											target='_blank'
											rel='noreferrer'
										>
											{isElderClaimed ? <Button text='View on OpenSea' /> : <Button disabled={true} text='View on OpenSea' />}
										</Link>
									</>
								</Card.Footer>
							</Card>
						</Col>
					</Row>
			</div>
		</>
	)
}

export default NFT
