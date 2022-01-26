import Loader from 'components/Loader'
import { Basket } from 'contexts/Baskets'
import { IndexType } from 'contexts/Baskets/types'
import useBaskets from 'hooks/useBaskets'
import React from 'react'
import 'react-tabs/style/react-tabs.css'
import BasketListItem from './BasketListItem'
import {
	ListLabelCol,
	ListLabelContainer,
	BasketListContainer,
	StyledLoadingWrapper,
	StyledSpacer,
} from './styles'

const BasketList: React.FC = () => {
	const [baskets] = useBaskets()

	const indexes: { [key: string]: Basket[] } = {
		[IndexType.baskets]: [],
	}

	baskets.forEach((basket, i) => {
		const basketWithIssuedTokens = {
			...basket,
			indexType: basket.indexType || IndexType.baskets,
		}

		indexes[basketWithIssuedTokens.indexType].push(basketWithIssuedTokens)
	})

	return (
		<BasketListContainer>
			<ListLabelContainer>
				<ListLabelCol width={'17.5%'} align={'left'}>
					Basket Name
				</ListLabelCol>
				<ListLabelCol width={'37.5%'} align={'center'}>
					Underlying Assets
				</ListLabelCol>
				<ListLabelCol width={'15%'} align={'center'}>
					Cost to Mint
				</ListLabelCol>
				<ListLabelCol width={'15%'} align={'center'}>
					24H Change
				</ListLabelCol>
				<ListLabelCol width={'15%'} align={'center'} />
			</ListLabelContainer>
			{indexes[IndexType.baskets].length ? (
				indexes[IndexType.baskets].map((basket, i) => (
					<React.Fragment key={i}>
						<BasketListItem basket={basket} />
						{i + 1 !== 0 && <StyledSpacer />}
					</React.Fragment>
				))
			) : (
				<StyledLoadingWrapper>
					<Loader text="Cooking the rice ..." />
				</StyledLoadingWrapper>
			)}
		</BasketListContainer>
	)
}

export default BasketList
