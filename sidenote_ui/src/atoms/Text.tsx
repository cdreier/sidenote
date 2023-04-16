import { Link } from 'react-router-dom'
import styled from 'styled-components'


const Text = styled.p`
  margin: 6px 0px;
  font-size: 16px;
  font-family: ${props => props.theme.fontFamily};
`

const Headline = styled.h1`
  font-size: 20px;
  margin: 6px 0px;
  font-family: ${props => props.theme.fontFamily};
`

const TextLink = styled(Link)`
  margin: 6px 0px;
  color: ${props => props.theme.color};
  text-decoration: none;
  font-size: 16px;
  font-family: ${props => props.theme.fontFamily};
`

const Metadata = styled.p`
  font-size: 12px;
  margin: 9px 0px;
  font-family: ${props => props.theme.fontFamily};
`

interface MetadataLinkProps {
  bold?: boolean
}

const MetadataLink = styled(Link) <MetadataLinkProps>`
  font-size: 12px;
  margin: 9px 0px;
  display: block;
  color: ${props => props.theme.color};
  text-decoration: none;
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
`

export {
  Text,
  Headline,
  TextLink,
  Metadata,
  MetadataLink,
}