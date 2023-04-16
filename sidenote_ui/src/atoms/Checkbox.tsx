import { useId, useState } from 'react'
import styled, { keyframes } from 'styled-components'

// https://getcssscan.com/css-checkboxes-examples -> #19

const animation_dothabottomcheck = keyframes`
  0% {
    height: 0;
  }
  100% {
    height: calc(var(--checkbox-height) / 2);
  }
`

const animation_dothatopcheck = keyframes`
  0% {
    height: 0;
  }
  50% {
    height: 0;
  }
  100% {
    height: calc(var(--checkbox-height) * 1.2);
  }
`

const Wrapper = styled.div`
  box-sizing: border-box;
  display: inline-block;
  --checkbox-height: 25px;

  input[type=checkbox] {
    display: none;
  }

  label {
    height: var(--checkbox-height);
    width: var(--checkbox-height);
    background-color: transparent;
    border: calc(var(--checkbox-height) * .1) solid #000;
    border-radius: 5px;
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    transition: border-color ease 0.2s;
    cursor: pointer;
  }

  label::before,
  label::after {
    box-sizing: border-box;
    position: absolute;
    height: 0;
    width: calc(var(--checkbox-height) * .2);
    background-color: #34b93d;
    display: inline-block;
    transform-origin: left top;
    border-radius: 5px;
    content: " ";
    transition: opacity ease 0.5;
  }
  label::before {
    top: calc(var(--checkbox-height) * .72);
    left: calc(var(--checkbox-height) * .41);
    box-shadow: 0 0 0 calc(var(--checkbox-height) * .05) transparent;
    transform: rotate(-135deg);
  }
  label::after {
    top: calc(var(--checkbox-height) * .37);
    left: calc(var(--checkbox-height) * .05);
    transform: rotate(-45deg);
  }

  input[type=checkbox]:checked + label,
  label.checked {
    border-color: #34b93d;
  }

  input[type=checkbox]:checked + label::after,
  label.checked::after {
    height: calc(var(--checkbox-height) / 2);
    animation: ${animation_dothabottomcheck} 0.2s ease 0s forwards;
  }
  input[type=checkbox]:checked + label::before,
  label.checked::before {
    height: calc(var(--checkbox-height) * 1.2);
    animation: ${animation_dothatopcheck} 0.4s ease 0s forwards;
  }
`

const Checkbox: React.FC<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> = (props) => {

  const id = useId()

  return (
    <Wrapper >
      <input type="checkbox" id={`checkbox-${id}`} {...props} />
      <label htmlFor={`checkbox-${id}`} className="check-box" />
    </Wrapper>
  )
}

export default Checkbox