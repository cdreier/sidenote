import styled from 'styled-components'


const List = styled.ul`
  list-style: square;
  margin: 0;
  padding-left: 20px;
`

const ListItem = styled.li``

interface CheckableListItemProps {
  checked: boolean
  setChecked: (c: boolean) => void
  children?: React.ReactNode
}

interface StyledCheckableListItemProps {
  checked?: boolean
}

const StyledCheckableListItem = styled(ListItem) <StyledCheckableListItemProps>`
  cursor: pointer;
  background-color: ${props => props.checked ? props.theme.palette[0] : 'none'};
`

const CheckableListItem: React.FC<CheckableListItemProps> = ({ children, checked, setChecked }) => {

  return (
    <StyledCheckableListItem onClick={() => setChecked(!checked)} checked={checked}>
      {children}
    </StyledCheckableListItem>
  )
}


export {
  List,
  ListItem,
  CheckableListItem,
}