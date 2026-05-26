import React from 'react'
import './LangSelect.css'

const LangSelect = ({ onSelect }) => {
  return (
    <div className='mainWindow'>
      <img
        src='../assets/icons/icons8-close-48.png'
        className='close-button'
        onClick={() => window.api.closeWindow()}
      />
      <div className='lang-container'>
        <button className='lang-box' onClick={() => onSelect('es')}>
          Español
        </button>
        <button className='lang-box' onClick={() => onSelect('en')}>
          English
        </button>
      </div>
      <p className='lang-made-by'>
        Made by{' '}
        <a className='lang-made-by-link' onClick={() => window.api.openExternal('https://github.com/isnotSenshi')}>
          sh1shn
        </a>
      </p>
    </div>
  )
}

export default LangSelect
