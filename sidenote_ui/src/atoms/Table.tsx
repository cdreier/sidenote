import styled from 'styled-components'


export const Table = styled.table`
  width: 100%;
  margin-bottom: 30px;
  td {
    padding: 6px 0;
    border-bottom: 1px solid ${props => props.theme.highlight};
  }
`