import styled from 'styled-components'

interface ButtonProps {
  $noBorder?: boolean
}

const Button = styled.button<ButtonProps>`
  background-color: transparent;
  ${props => props.$noBorder ? `
    border-style: none;
  ` : `
    border: 1px solid white;
    border-radius: 1px;
  `}
  color: white;
  padding: 3px 9px;
  min-width: 20px;
  font-family: ${props => props.theme.fontFamily};
  text-decoration: none;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  display: inline;
`

const ButtonFlex = styled(Button)`
  flex: 1;
`

export {
  Button,
  ButtonFlex,
}