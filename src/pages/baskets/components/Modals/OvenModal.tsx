import { ActiveSupportedBasket } from '@/bao/lib/types'
import { BalanceWrapper } from '@/components/Balance'
import Button from '@/components/Button'
import { BalanceInput } from '@/components/Input'
import { LabelEnd, LabelStart } from '@/components/Label'
import { StatBlock } from '@/components/Stats'
import useBao from '@/hooks/base/useBao'
import useOvenInfo from '@/hooks/baskets/useOvenInfo'
import {
	AssetLabel,
	AssetStack,
	CloseButton,
	HeaderWrapper,
	IconFlex,
	LabelStack,
	MaxLabel,
	ModalStack,
} from '@/pages/markets/components/styles'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'

type ModalProps = {
	basket: ActiveSupportedBasket
	show: boolean
	hideModal: () => void
}

const OvenModal: React.FC<ModalProps> = ({ basket, show, hideModal }) => {
	const [value, setValue] = useState<string | undefined>()
	const [ethBalance, setEthBalance] = useState<BigNumber | undefined>()

	const bao = useBao()
	const { account } = useWeb3React()
	const ovenInfo = useOvenInfo(basket, account)

	useEffect(() => {
		if (!(bao && account)) return

		bao.web3.eth.getBalance(account).then((balance: any) => setEthBalance(decimate(balance)))
	}, [bao, account])

	return basket ? (
		<>
			<Modal show={show} onHide={hideModal} centered>
				<CloseButton onClick={hideModal}>
					<FontAwesomeIcon icon={faTimes} />
				</CloseButton>
				<Modal.Header>
					<Modal.Title id='contained-modal-title-vcenter'>
						<HeaderWrapper>
							<p>{basket.symbol} Oven</p>
							<Image src={basket.icon} />
						</HeaderWrapper>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<StatBlock
						label='Oven Information'
						stats={
							ovenInfo && [
								{
									label: 'Total ETH Deposited',
									value: (
										<span>
											{getDisplayBalance(ovenInfo.balance)} <FontAwesomeIcon icon={faEthereum} />
										</span>
									),
								},
								{
									label: 'Your Deposit',
									value: (
										<span>
											{getDisplayBalance(ovenInfo.userBalance)} <FontAwesomeIcon icon={faEthereum} />
										</span>
									),
								},
							]
						}
					/>
					<ModalStack>
						<BalanceWrapper>
							<Col xs={4}>
								<LabelStart />
							</Col>
							<Col xs={8}>
								<LabelEnd>
									<LabelStack>
										<MaxLabel>{`Available:`}</MaxLabel>
										<AssetLabel>{`${ethBalance && ethBalance.toFixed(4)} ETH`}</AssetLabel>
									</LabelStack>
								</LabelEnd>
							</Col>
						</BalanceWrapper>
						<Row>
							<Col xs={12}>
								<BalanceInput
									value={value}
									onChange={e => setValue(e.currentTarget.value)}
									onMaxClick={undefined}
									label={
										<AssetStack>
											<IconFlex>
												<FontAwesomeIcon icon={faEthereum} />
											</IconFlex>
										</AssetStack>
									}
								/>
							</Col>
						</Row>
					</ModalStack>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={undefined}>{!value ? 'Enter a Value' : `Deposit ${value} ETH`}</Button>
				</Modal.Footer>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default OvenModal
