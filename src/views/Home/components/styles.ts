import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'

export const HeroHeader = styled.h6`
  font-family: 'Kaushan Script', sans-serif;
  font-size: 7rem;
  letter-spacing: -0.1rem;
  font-weight: ${(props) => props.theme.fontWeight.strong} !important;
  color: ${(props) => props.theme.color.text[100]};
  margin-top: ${(props) => props.theme.spacing[6]}px;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    font-size: 5rem !important;
    line-height: 4.7rem;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 3.5rem !important;
    line-height: 3.2rem;
    text-align: left;
  }
`

export const HeroSubHeader = styled.h6`
  font-family: 'Kaushan Script', sans-serif;
  font-size: 4rem !important;
  letter-spacing: -0.2rem;
  font-weight: ${(props) => props.theme.fontWeight.medium} !important;
  color: ${(props) => props.theme.color.text[100]};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 2rem !important;
  }
`

export const HeroText = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.color.text[200]};
  font-weight: ${(props) => props.theme.fontWeight.medium};
  margin: auto;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    text-align: left;
    font-size: 1.15rem;
  }
`

export const StyledSectionContainer = styled.div`
  display: flex;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex-direction: column;
  }
`

export const StyledSectionTitle = styled.h2`
  font-size: 2rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.grey[100]};
  padding-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`

export const StyledCardWrapper = styled.div`
  display: flex;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    flex-direction: column;
  }
`

export const StyledCardContainer = styled.div`
  flex: 1;
`

export const StyledCardContent = styled.div`
  color: ${(props) => props.theme.color.text[100]};
  padding: ${(props) => props.theme.spacing[4]}px;
  background: ${(props) => props.theme.color.primary[100]};
  border-radius: ${(props) => props.theme.borderRadius}px;
  height: 550px;
  width: 100%;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    padding: ${(props) => props.theme.spacing[2]}px;
    height: 250px;
  }
`

export const StyledCardParralax = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateZ(60px);
`

export const StyledCardTitle = styled.p`
  font-size: 2rem;
  font-weight: ${(props) => props.theme.fontWeight.strong};
  margin-bottom: ${(props) => props.theme.spacing[3]}px;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 1.5rem;
    margin-bottom: ${(props) => props.theme.spacing[1]}px;
  }
`

export const StyledCardIcon = styled.img`
  margin: ${(props) => props.theme.spacing[4]}px auto;
  display: block;
  height: 80px;
  width: 80px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    display: block;
    margin: ${(props) => props.theme.spacing[3]}px auto;
    height: 50px;
    width: 50px;
  }
`

export const StyledCardText = styled.p`
  font-size: 1.25rem;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 1rem;
  }
`

export const InfoWrapper = styled(Row)`
  width: 80%;
  margin: auto;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    flex-direction: column;
    width: 100%;
  }
`

export const InfoImageCol = styled(Col)`
  margin-bottom: 5em;
  width: 30%;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    width: 90%;
    margin: auto;
    margin-bottom: ${(props) => props.theme.spacing[5]}px;
  }
`

export const InfoImageContainer = styled.div`
  display: flex;
  margin: auto;
  height: 100%;
`

export const InfoCol = styled(InfoImageCol)`
  display: table;
  width: 70%;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    width: 100%;
  }
`

export const InfoContainer = styled.div`
  margin: auto;
  display: table-cell;
  vertical-align: middle;
  width: 100%;
  height: 100%;
`

export const InfoHeader = styled.h2`
  font-family: 'Kaushan Script', sans-serif;
  font-size: 3rem;
  font-weight: ${(props) => props.theme.fontWeight.strong};

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    font-size: 4rem !important;
    letter-spacing: -0.1rem;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 3rem !important;
    letter-spacing: -0.1rem;
  }
`

export const InfoSubHeader = styled(InfoHeader)`
  display: inline-block;
  background: ${(props) => props.theme.heroGradient};
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bounce 10s ease-in-out infinite alternate;

  @keyframes bounce {
    to {
      background-position: 200%;
    }
  }
`

export const InfoText = styled.p`
  color: ${(props) => props.theme.color.text[100]};
  font-size: 1.25rem;
  font-weight: ${(props) => props.theme.fontWeight.medium};
`

export const InfoImage = styled.img`
  max-width: 100%;
  height: auto;
  margin-inline: auto;
  margin: 0 ${(props) => props.theme.spacing[3]}px;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    margin-inline: 0;
    max-width: 70%;
    margin: auto;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    margin-inline: 0;
    max-width: 80%;
    margin: auto;
  }
`

export const GraphContainer = styled(Col)`
  width: 100%;
  height: 350px;
  margin: 0 auto ${(props) => props.theme.spacing[6]}px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  overflow: hidden;
  background: ${(props) => props.theme.color.primary[100]};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    height: 250px;
  }
`

export const PriceGraphContainer = styled.div`
  width: 80%;
  margin: 0 auto;
`

export const StyledGraphContainer = styled(GraphContainer)`
  width: 100%;
  margin: ${(props) => props.theme.spacing[5]}px auto 0;
`

export const AnalyticsContainer = styled(Row)`
  display: flex;
  flex-direction: row;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => props.theme.color.primary[100]};
  box-shadow: ${(props) => props.theme.boxShadow.default};
  border: ${(props) => props.theme.border.default};
  position: relative;
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  height: 125px;
  margin-bottom: 125px;

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    flex-direction: column;
    margin: ${(props) => props.theme.spacing[6]}px auto;
    position: relative;
    width: auto;
    min-height: 133px;
    height: auto;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.uhd}px) {
    position: relative;
    margin: ${(props) => props.theme.spacing[5]}px auto;
    left: 0;
    transform: none;
  }
`

export const Analytic = styled(Col)`
  margin: auto;
  text-align: center;
  height: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1;
  padding: ${(props) => props.theme.spacing[5]}px;
  border-right: ${(props) => props.theme.border.default};

  &:first-child {
  }

  &:last-child {
    border-right: none;
  }

  span > h2 {
    font-family: 'Rubik', sans-serif;
    font-weight: ${(props) => props.theme.fontWeight.medium};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.fhd}px) {
    border-right: none;
    border-bottom: 1px solid ${(props) => props.theme.color.transparent[200]};
    flex: auto !important;
    padding-bottom: ${(props) => props.theme.spacing[3]}px;
    padding-top: ${(props) => props.theme.spacing[3]}px;

    &:first-child {
    }

    &:last-child {
      border-bottom: none;
    }
  }
`

export const NestBoxHeader = styled.div`
  font-family: 'KaushanScript', sans-serif;
  color: ${(props) => props.theme.color.text[100]};
  margin: auto;
  font-size: 2rem;

  p {
    margin: 0;
  }

  span.badge {
    font-size: 1.25rem;
    margin-bottom: ${(props) => props.theme.spacing[3]}px;
  }

  span.smalltext {
    float: right;
    font-size: 0.5rem;
    margin-top: ${(props) => props.theme.spacing[3]}px;
    margin-left: ${(props) => props.theme.spacing[2]}px;
  }

  img {
    text-align: center;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    font-size: 1.5rem;
  }
`

export const PrefButtons = styled.div`
  margin: auto;

  > button {
    float: left;
    margin-left: ${(props) => props.theme.spacing[2]}px;
    margin-top: ${(props) => props.theme.spacing[4]}px;
    color: ${(props) => props.theme.color.text[100]};
    border-radius: ${(props) => props.theme.borderRadius}px;
    width: 48px;
    background: ${(props) => props.theme.color.primary[100]};

    &:hover,
    &.active,
    &:active,
    &:focus {
      border: 2px solid transparent;
      color: ${(props) => props.theme.color.text[100]};
      background: ${(props) => props.theme.buttonGradient.a};
      box-shadow: none !important;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
    display: none;
  }
`

export const FloatingWrapper = styled.div`
	top: 3rem;
	right: 0rem;
	position: absolute;
	overflow: hidden;
	animation: bannerImgBounce 5s ease-in-out 0s infinite alternate;
	max-width: 100%;
	height: auto;

	@keyframes bannerImgBounce {
		0% {
			-webkit-transform: translateY(0);
			transform: translateY(0);
		}
		100% {
			-webkit-transform: translateY(-20px);
			transform: translateY(-20px);
		}
	}
`

export const FloatingImage = styled.img`
	display: block;
	right: 0rem;
	height: 440px;
`

export const StyledLeft = styled.div`
	position: relative;
	display: flex;
	margin-left: auto;
	margin-right: auto;
	max-width: 1280px;
	margin-top: 6rem;
	margin-bottom: 2rem;
	@media (min-width: 1024px) {
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-gap: 2rem;
		gap: 2rem;
		display: grid;
		padding: 2rem;
		margin-top: 6rem;
	}
`

export const StyledLeftTitle = styled.div`
  display: flex;
  flex-direction: column;
  will-change: transform;
  margin: 0 auto;
  padding: 0 1rem 0 1rem;
}
@media (min-width: 640px) {
  text-align: center;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
  @media (min-width: 768px) {
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
}
@media (min-width: 1024px) {
  grid-column: span 6/span 6;
  text-align: left;
  display: flex;
}
`

export const StyledLeftSubTitle = styled.h1`
	font-weight: 600;
	margin-top: 1.5rem;
	pointer-events: none;
	white-space: wrap;
	overflow-wrap: normal;
	font-family: 'Kaushan Script';
	letter-spacing: -0.025em;
	text-align: center;
	@media (min-width: 640px) {
		margin-top: 1.25rem;
		line-height: 1;
		text-align: center;
		font-size: 2rem;
	}
	@media (min-width: 1024px) {
		margin-top: 1.5rem;
		font-size: 3rem;
		line-height: 1;
		text-align: left;
	}
	@media (min-width: 1280px) {
		font-size: 3rem;
		line-height: 1;
	}
`
export const StyledLeftText = styled.h2`
	margin-top: 0.75rem;
	font-size: 1rem;
	line-height: 1.5rem;

	@media (min-width: 640px) {
		margin-top: 1.125rem;
		font-size: 1.2rem;
		line-height: 1.75rem;
		text-align: center;
	}
	@media (min-width: 1024px) {
		font-size: 1.125rem;
		line-height: 1.75rem;
		text-align: left;
	}
	@media (min-width: 1280px) {
		font-size: 1.25rem;
		line-height: 1.75rem;
	}
`