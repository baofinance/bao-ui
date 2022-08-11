import React, { useEffect, useState } from 'react'
import useBao from '../../../../hooks/base/useBao'
import { Col, Modal, Row } from 'react-bootstrap'
import {
	AssetLabel,
	AssetStack,
	CloseButton,
	HeaderWrapper,
	IconFlex,
	LabelStack,
	MaxLabel,
	ModalStack,
} from '../../../Markets/components/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../../../components/Button'
import { BalanceWrapper } from '../../../../components/Balance'
import { LabelEnd, LabelStart } from '../../../../components/Label'
import { BalanceInput } from '../../../../components/Input'
import { ActiveSupportedBasket } from '../../../../bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { decimate, getDisplayBalance } from '../../../../utils/numberFormat'
import useOvenInfo from '../../../../hooks/baskets/useOvenInfo'
import { StatBlock } from '../../../../components/Stats'

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

		bao.web3.eth.getBalance(account).then(balance => setEthBalance(decimate(balance)))
	}, [bao, account])

	return basket ? (
		<>
			<Modal show={show} onHide={hideModal} centered>
				<CloseButton onClick={hideModal}>
					<FontAwesomeIcon icon='times' />
				</CloseButton>
				<Modal.Header>
					<Modal.Title id='contained-modal-title-vcenter'>
						<HeaderWrapper>
							<p>{basket.symbol} Oven</p>
							<img src={basket.icon} />
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
											{getDisplayBalance(ovenInfo.balance)} <FontAwesomeIcon icon={['fab', 'ethereum']} />
										</span>
									),
								},
								{
									label: 'Your Deposit',
									value: (
										<span>
											{getDisplayBalance(ovenInfo.userBalance)} <FontAwesomeIcon icon={['fab', 'ethereum']} />
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
												<FontAwesomeIcon icon={['fab', 'ethereum']} />
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
