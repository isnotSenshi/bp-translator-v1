import React, { useState, useEffect } from 'react'
import Typewriter from 'typewriter-effect'
import './DialogContainer.css'
import { t } from '../../Utils/i18n.js'

export const DialogContainer = ({ bPants, typoWr }) => {
     const [mustContext, setMustContext] = useState(false)
     const [engine, setEngine] = useState('openai')
     const [lang, setLang] = useState('es')

     useEffect(() => {
          window.api.getState('engine').then(setEngine)
          window.api.getState('lang').then(l => { if (l) setLang(l) })
          window.api.onStateChanged((key, val) => {
               if (key === 'engine') setEngine(val)
               if (key === 'lang') setLang(val)
          })
     }, [])

     const toggleContext = () => {
          const next = !mustContext
          setMustContext(next)
          window.api.setState('mustContext', next)
     }

     const handleContextChange = (value) => {
          window.api.setState('storyContext', value)
     }

     return (
          <div className="dialog-container">
               <div className="dialog-box">
                    <div className="img-col">
                         <img src={bPants} className="app-img" />
                         {<button
                              disabled={engine === 'local'}
                              className={`context-toggle ${mustContext ? 'context-toggle--on' : ''}`}
                              onClick={toggleContext}
                         >
                              {engine === 'local' ? t('CTX_OFF', lang) : t('CTX_ON', lang)}
                         </button>}
                    </div>
                    <div className="text-box">
                         <Typewriter options={typoWr} />
                    </div>
               </div>
               {mustContext && <input
                    className="context-input"
                    placeholder={t('CTX_PLACEHOLDER', lang)}
                    onChange={(e) => handleContextChange(e.target.value)}
               />}
          </div>
     )
}
