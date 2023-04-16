import { FC, useState } from 'react'
import styled from 'styled-components'


const Form = styled.form``

interface SubmittableInputProps {
  onSubmit: (txt: string) => void
  clearOnSubmit?: boolean
  className?: string
}

const SubmittableInput: FC<SubmittableInputProps> = ({ onSubmit, className, clearOnSubmit = true }) => {

  const [txt, setTxt] = useState('')

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(txt)
    if (clearOnSubmit) {
      setTxt('')
    }
  }

  return (
    <Form onSubmit={e => submit(e)} className={className}>
      <input value={txt} onChange={e => setTxt(e.target.value)} />
    </Form>
  )

}


export default SubmittableInput