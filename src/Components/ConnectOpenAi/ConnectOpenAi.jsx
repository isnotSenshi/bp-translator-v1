import React, { useState, useEffect } from 'react'
import './ConnectOpenAi.css'
import { validarApiKey } from '../../Scripts/validateToken'
import { t } from '../../Utils/i18n.js'

const ConnectOpenAi = ({ onBack, lang }) => {
     const [apiKey, setApiKey] = useState('')
     const [bPants, setbPants] = useState(null)

     useEffect(() => {
          window.api.getSavedKey('openai').then(key => { if (key) setApiKey(key) })
     }, [])

     const triggerValidation = async () => {
          await validarApiKey(apiKey).then(valor => {
               if (valor) {
                    setbPants(null)
                    window.api.setState('apiKey', String(apiKey))
                    window.api.setState('engine', 'openai')
                    window.api.setState('storyContext', '')
               } else {
                    setbPants('../assets/bPants/Burgerpants6.gif')
               }
          })
     }

     return (
          <div className='mainWindow'>
               <div className='input-container'>
                    <>
                         {bPants && <img src={bPants} width={'30%'} />}
                         <img src='../assets/icons/icons8-close-48.png' className='close-button' onClick={() => window.api.closeWindow()} />
                         {onBack && <button className='custom-button back-button' onClick={onBack}>{t('BACK', lang)}</button>}
                         <p className='openai-hint'>{t('OPENAI_HINT', lang)} <strong className='openai-link' onClick={() => window.api.openExternal('https://platform.openai.com/api-keys')}>platform.openai.com</strong></p>
                         <div>
                              <input className='custom-input' placeholder={t('OPENAI_INPUT', lang)} value={apiKey} onChange={(e) => setApiKey(e?.target?.value)} />
                         </div>
                         <div>
                              <button className='custom-button' onClick={() => triggerValidation()}>{t('VALIDATE', lang)}</button>
                         </div>
                    </>
               </div>
          </div>
     )
}

export default ConnectOpenAi
