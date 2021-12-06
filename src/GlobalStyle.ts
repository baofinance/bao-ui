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
    overflow-x: hidden; /* Hide horizontal scrollbar */
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
    font-weight: bold;
  }

  a {
    color: #f7f4f2;
    text-decoration: none;
  }

  a:hover,
  a:focus {
    color: #ce6509;
  }

  .baoTicker {
    color: #50251c;
    background-color: #efeae7 !important;
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
    color: ${(props: any) => props.theme.color.text[300]};
    background-color: ${(props: any) => props.theme.color.primary[200]};
    border: none;
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
    border-bottom: 1px solid ${(props: any) => props.theme.color.primary[200]};;
  }

  .modal-footer {
    border-top: 1px solid ${(props: any) => props.theme.color.primary[200]};;
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
`

export default GlobalStyle
