import pollyNests from 'assets/img/polly-nests.png'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import WalletProviderModal from 'components/WalletProviderModal'
import useModal from 'hooks/useModal'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Switch } from 'react-router-dom'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import {
	Borrow,
	Borrowed,
	Overview,
	Supplied,
	Supply,
} from './components/Tables'

const Markets: React.FC = () => {
	const { account, ethereum }: any = useWallet()
	const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

	return (
		<Switch>
			<Page>
				<>
					<PageHeader
						icon={pollyNests}
						title="Markets"
						subtitle="Mint, Lend, Borrow"
					/>
					<Container>
						<Section>
							<SectionHeader>Dashboard</SectionHeader>
							<SectionInner>
								<Overview />
								<UserOverview>
									<Supplied />
									<Borrowed />
								</UserOverview>
							</SectionInner>
						</Section>
						<MarketOverview>
							<Supply />
							<Borrow />
						</MarketOverview>
					</Container>
				</>
			</Page>
		</Switch>
	)
}

const Section = styled.div`
	display: block;
	width: 100%;
	padding: ${(props) => props.theme.spacing[4]}px;
	padding-top: 0px;
	border-radius: ${(props) => props.theme.borderRadius}px;
`

const SectionHeader = styled.div`
	color: ${(props) => props.theme.color.text[100]};
	font-size: 1.25rem;
	font-weight: ${(props) => props.theme.fontWeight.strong};
	margin: 0;
	text-align: center;
	align-content: center;
	padding-bottom: ${(props) => props.theme.spacing[2]}px;
`

const SectionInner = styled.div`
	justify-content: center;
	width: 100%;
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
	border: ${(props) => props.theme.border.default};
	box-shadow: ${(props) => props.theme.boxShadow.default};
`

const UserOverview = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

const MarketOverview = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
}
`

export default Markets
