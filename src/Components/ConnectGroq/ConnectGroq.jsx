import React, { useState, useEffect } from 'react'
import './ConnectGroq.css'
import { t } from '../../Utils/i18n.js'

const ConnectGroq = ({ onBack, lang }) => {
     const [apiKey, setApiKey] = useState('')
     const [bPants, setbPants] = useState(null)

     useEffect(() => {
          window.api.getSavedKey('groq').then(key => { if (key) setApiKey(key) })
     }, [])

     const triggerValidation = async () => {
          const valid = await window.api.validateGroqKey(apiKey)
          if (valid) {
               setbPants(null)
               window.api.setState('apiKey', String(apiKey))
               window.api.setState('engine', 'groq')
               window.api.setState('storyContext', '')
          } else {
               setbPants('../assets/bPants/Burgerpants6.gif')
          }
     }

     return (
          <div className='mainWindow'>
               <div className='input-container'>
                    <>
                         {bPants && <img src={bPants} width={'30%'} />}
                         <img src='../assets/icons/icons8-close-48.png' className='close-button' onClick={() => window.api.closeWindow()} />
                         {onBack && <button className='custom-button back-button' onClick={onBack}>{t('BACK', lang)}</button>}
                         <p className='groq-hint'>{t('GROQ_HINT', lang)} <strong className='groq-link' onClick={() => window.api.openExternal('https://console.groq.com')}>console.groq.com</strong></p>
                         <div>
                              <input className='custom-input' placeholder={t('GROQ_INPUT', lang)} value={apiKey} onChange={(e) => setApiKey(e?.target?.value)} />
                         </div>
                         <div>
                              <button className='custom-button' onClick={triggerValidation}>{t('VALIDATE', lang)}</button>
                         </div>
                    </>
               </div>
          </div>
     )
}

export default ConnectGroq
