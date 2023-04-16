import styled from 'styled-components'

interface VisibilityProps {
  hidden?: boolean
  default?: string
}

export const Visibility = styled.div<VisibilityProps>`
  display: ${props => props.hidden ? 'none !important' : props.default || 'block'};
`