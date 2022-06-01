import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    background: ${(props: any) => props.theme.backgroundGradient.default};
    margin: 0;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${(props: any) => props.theme.color.text[100]};
    transition: 200ms;
  }

  html {
    overflow-y: scroll;
  }

  html,
  body,
  #root {
    height: 100%;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
  }

  b {
    font-weight: ${(props) => props.theme.fontWeight.medium};
  }

  a {
		color: ${(props) => props.theme.color.text[100]};
    text-decoration: none;
  }

  a:hover,
  a:focus {
		color: ${(props) => props.theme.color.text[300]};
  }

  .baoTicker {
    color: ${(props) => props.theme.color.text[100]};
    background-color: ${(props) => props.theme.color.primary[100]} !important;
    padding: 1rem;
    border-radius: 8px;
  }

  .outline-primary {
    border: none !important;
  }

  .tooltip {
    border: none;
  }

  .tooltip > .tooltip-inner {
    background-color: ${(props) => props.theme.color.primary[200]};
    color: ${(props) => props.theme.color.text[100]};
    font-weight: ${(props) => props.theme.fontWeight.medium};
  }

  .tooltip.bs-tooltip-left > .tooltip-arrow::before {
    border-left-color: ${(props) => props.theme.color.primary[300]};
  }

  .tooltip.bs-tooltip-right > .tooltip-arrow::before {
    border-right-color: ${(props) => props.theme.color.primary[300]};
  }

  .tooltip.bs-tooltip-top > .tooltip-arrow::before {
    border-top-color: ${(props) => props.theme.color.primary[300]};
  }

  .tooltip.bs-tooltip-bottom > .tooltip-arrow::before {
    border-bottom-color: ${(props) => props.theme.color.primary[300]};
  }

  ::selection {
    background-color: #50251c;
    color: #fff;
  }

  .buttonActive {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[200]};
    border: ${(props) => props.theme.border.default};
  }

  .buttonActive:hover {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[200]};
  }

  .buttonInactive {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[300]};
    border: ${(props) => props.theme.border.default};
  }

  .modal {
    backdrop-filter: blur(6px);
  }
  
  .modal-content {
    background-color: ${(props: any) =>
      props.theme.color.primary[100]} !important;
    border-radius: 8px;
    border: ${(props) => props.theme.border.default};
    box-shadow: ${(props) => props.theme.boxShadow.default};
  }

  .modal-header {
    border-bottom: none;
  }

  .modal-title {
    display: flex;
    align-items: center;
    flex-direction: row;
    min-width: 6rem;
    font-size: ${(props) => props.theme.fontSize.xl};
    font-family: 'Rubik', sans-serif;
    font-weight: ${(props) => props.theme.fontWeight.strong};
  
      img {
        vertical-align: middle;
        height: 30px;
        width: 30px;
      }
  
      p {
        display: block;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin: 0px;
        margin-top: 0px;
        margin-inline: 0.5rem 0.5rem;
        margin-bottom: 0px;
        color: ${(props) => props.theme.color.text[100]};
        font-weight: ${(props) => props.theme.fontWeight.medium};
      }
    }
  
  .modal-footer {
    border-top: none;
  }

  .modal-open {
    padding-right: 0px !important;
  }

  .btn {
    border: ${(props) => props.theme.border.default};
    outline: none !important;
  }

  .btn:active {
    border: ${(props) => props.theme.border.default};
    outline: none !important;
  }

  .btn-close {
    float: right;
    top: ${(props) => props.theme.spacing[3]}px;
    right: ${(props) => props.theme.spacing[3]}px;
    font-size: 1rem;
    position: absolute;
    color: ${(props) => props.theme.color.text[200]};
    transition: 200ms;

    &:hover {
      cursor: pointer;
    }
  }

  .form-check-input:checked {
    background-color: ${(props: any) => props.theme.color.text[400]};
    border-color: ${(props: any) => props.theme.color.text[400]};
    cursor: pointer;
  }

  .form-check-input {
    background-color: ${(props: any) => props.theme.color.text[200]};
    border: 1px solid ${(props: any) => props.theme.color.text[200]};
    cursor: pointer;
  }

  .accordion-item:first-of-type .accordion-button {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .accordion-item:last-of-type .accordion-button.collapsed {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.card {
  background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
  border: ${(props) => props.theme.border.default};
}

.card-header {
  background-color: ${(props) => props.theme.color.primary[100]};
  text-align: center;
  border: none;
  padding-top: 1rem;
  padding-bottom: 0;
}

.card-footer {
  background-color: ${(props) => props.theme.color.primary[100]};
  border: none;
}

.badge {
  background-color: ${(props) => props.theme.color.text[200]};
  color: ${(props) => props.theme.color.text[100]};
  font-weight: ${(props) => props.theme.fontWeight.medium};
  vertical-align: middle;
  font-size: 1rem;
}

.container, .container-sm, .container-md {
  @media (max-width: ${(props) => props.theme.breakpoints.xl}px) {
    max-width: 1200px;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.md}px) {
    max-width: 720px;
  }
}

svg.menuIcon {
  fill: ${(props) => props.theme.color.text[100]};
}

.row.farmRow {
  @media (max-width: ${(props) => props.theme.breakpoints.xl}px) {
    --bs-gutter-x: 0;
    --bs-gutter-y: 0;  
  }
}
`

export default GlobalStyle
