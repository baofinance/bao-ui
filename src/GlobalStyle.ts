import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    background: ${(props: any) => props.theme.color.background[100]};
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
    color: ${props => props.theme.color.text[100]};
    background-color: ${props => props.theme.color.primary[100]} !important;
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
    background-color: #181524;
  }

  .tooltip.bs-tooltip-left > .tooltip-arrow::before {
    border-left-color: #181524;
  }

  .tooltip.bs-tooltip-right > .tooltip-arrow::before {
    border-right-color: #181524;
  }

  .tooltip.bs-tooltip-top > .tooltip-arrow::before {
    border-top-color: #181524;
  }

  .tooltip.bs-tooltip-bottom > .tooltip-arrow::before {
    border-bottom-color: #181524;
  }

  ::selection {
    background-color: #50251c;
    color: #fff;
  }

  .buttonActive {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[200]};
    border: none;
    box-shadow: ${(props) => props.theme.boxShadow.invert};
  }

  .buttonActive:hover {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[200]};
  }

  .buttonInactive {
    color: ${(props: any) => props.theme.color.text[100]};
    background-color: ${(props: any) => props.theme.color.primary[300]};
    border: none;
  }

  .modal-content {
    background-color: ${(props: any) =>
      props.theme.color.primary[100]} !important;
    border: 1px solid ${(props: any) => props.theme.color.primary[100]};
    border-radius: 8px;
  }

  .modal-header {
    border-bottom: 1px solid ${(props: any) => props.theme.color.primary[200]};
  }

  .modal-footer {
    border-top: 1px solid ${(props: any) => props.theme.color.primary[200]};
  }

  .modal-open {
    padding-right: 0px !important; 
  }

  .btn {
    border: none !important;
    outline: none !important;
  }

  .btn:active {
    border: none !important;
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
	display: flex;
	flex: 1;
	flex-direction: column;
  border: ${(props) => props.theme.border.default};
  box-shadow: ${(props) => props.theme.boxShadow.default};
}

.badge {
  background-color: ${(props) => props.theme.color.text[200]};
  color: ${(props) => props.theme.color.text[100]};
  border: ${(props) => props.theme.border.default};
  box-shadow: ${(props) => props.theme.boxShadow.default};
  font-weight: ${(props) => props.theme.fontWeight.medium};
  vertical-align: middle;
  font-size: 1rem;
}
`

export default GlobalStyle
