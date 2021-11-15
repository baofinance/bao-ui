import chopsticks from 'assets/img/floatingbao.png'
import React from 'react'
import {
	FloatingImage,
	FloatingWrapper,
	StyledLeft,
	StyledLeftSubTitle,
	StyledLeftText,
	StyledLeftTitle,
} from './styles'

const SectionOne: React.FC = () => (
	<>
		<StyledLeft>
			<StyledLeftTitle>
				<StyledLeftSubTitle>Deliciously wrapped finance!</StyledLeftSubTitle>
				<StyledLeftText>
					Bao (包) stands for a treasure or package. Something wonderful that is
					wrapped up in another layer. Bao buns, or in Chinese Baozi (包子) are
					delicious wrapped dumplings. These bao buns are the tradition of
					taking something good that exists, and wrapping it up into being a new
					treasure. Bao Finance aims to do this by being a new protocol that
					adds features to existing DeFi systems.
				</StyledLeftText>
			</StyledLeftTitle>
		</StyledLeft>
		<FloatingWrapper style={{ maxWidth: '700px' }}>
			<FloatingImage src={chopsticks} />
		</FloatingWrapper>{' '}
	</>
)

export default SectionOne
