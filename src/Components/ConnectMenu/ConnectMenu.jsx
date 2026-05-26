import React, { useState, useEffect, useRef } from 'react'
import './ConnectMenu.css'
import ConnectOpenAi from '../ConnectOpenAi/ConnectOpenAi'
import ConnectGroq from '../ConnectGroq/ConnectGroq'
import SetupScreen from '../SetupScreen/SetupScreen'
import { t } from '../../Utils/i18n.js'

const ConnectMenu = ({ lang, onBack }) => {
     const [selected, setSelected] = useState(null)
     const [ocrProgress, setOcrProgress] = useState(0)
     const [ocrReady, setOcrReady] = useState(false)
     const [ocrError, setOcrError] = useState(null)
     const [pythonSetupDone, setPythonSetupDone] = useState(true)
     const [isOnline, setIsOnline] = useState(false)
     const [appVersion, setAppVersion] = useState('')
     const intervalRef = useRef(null)

     useEffect(() => {
          window.api.getAppVersion().then(v => setAppVersion(v))

          window.api.checkPythonSetup().then(done => {
               setPythonSetupDone(done)
               if (!done) return
          })

          window.api.getOcrReady().then(ready => {
               if (ready) {
                    setOcrProgress(100)
                    setOcrReady(true)
               } else {
                    startFakeProgress()
               }
          })

          window.api.onOcrReady(() => {
               setOcrProgress(100)
               setOcrReady(true)
               if (intervalRef.current) clearInterval(intervalRef.current)
          })

          window.api.onOcrError((errType) => {
               if (intervalRef.current) clearInterval(intervalRef.current)
               setOcrError(errType)
          })

          window.api.checkConnection().then(setIsOnline)

          const handleOnline = () => window.api.checkConnection().then(setIsOnline)
          const handleOffline = () => setIsOnline(false)
          window.addEventListener('online', handleOnline)
          window.addEventListener('offline', handleOffline)

          return () => {
               if (intervalRef.current) clearInterval(intervalRef.current)
               window.removeEventListener('online', handleOnline)
               window.removeEventListener('offline', handleOffline)
          }
     }, [])

     const startFakeProgress = () => {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = setInterval(() => {
               setOcrProgress(prev => {
                    if (prev >= 90) {
                         clearInterval(intervalRef.current)
                         return prev
                    }
                    const increment = (90 - prev) * 0.04 + 0.3
                    return Math.min(prev + increment, 90)
               })
          }, 400)
     }

     if (selected === 'openai') return <ConnectOpenAi onBack={() => setSelected(null)} lang={lang} />
     if (selected === 'groq') return <ConnectGroq onBack={() => setSelected(null)} lang={lang} />
     if (selected === 'setup') return (
          <SetupScreen
               lang={lang}
               onBack={() => setSelected(null)}
               onComplete={() => {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    setOcrProgress(0)
                    setOcrReady(false)
                    setOcrError(null)
                    setPythonSetupDone(true)
                    setSelected(null)
                    startFakeProgress()
               }}
          />
     )

     const handleLocal = async () => {
          if (ocrError) return
          const setupDone = await window.api.checkPythonSetup()
          if (!setupDone) {
               setSelected('setup')
               return
          }
          if (!ocrReady) return
          window.api.setState('engine', 'local')
          window.api.setState('storyContext', '')
     }

     const ocrDesc = () => {
          if (ocrError === 'no-python')      return t('LOCAL_NO_PYTHON', lang)
          if (ocrError === 'module-missing') return t('LOCAL_MISSING_DEPS', lang)
          if (ocrError)                      return t('LOCAL_ERROR', lang)
          if (!pythonSetupDone)              return t('LOCAL_SETUP_FIRST', lang)
          if (ocrReady)                      return t('LOCAL_READY', lang)
          return `${t('LOCAL_LOADING', lang)} ${Math.floor(ocrProgress)}%`
     }

     return (
          <div className='mainWindow'>
               <img src='../assets/icons/icons8-close-48.png' className='close-button' onClick={() => window.api.closeWindow()} />
               {onBack && <button className='custom-button back-button' onClick={onBack}>{t('BACK', lang)}</button>}
               <div className='menu-container'>
                    <p className='menu-title'>{t('MENU_TITLE', lang)}</p>
                    <button
                         className={`menu-option-button ${!isOnline ? 'offline' : ''}`}
                         onClick={() => isOnline && setSelected('openai')}
                    >
                         <span className='option-label'>OpenAI (+++) </span>
                         <span className='option-desc'>
                              {isOnline ? t('OPENAI_DESC', lang) : t('NO_INTERNET', lang)}
                         </span>
                    </button>
                    <button
                         className={`menu-option-button ocr-button ${ocrError ? 'ocr-error' : (pythonSetupDone && !ocrReady) ? 'ocr-loading' : ''}`}
                         onClick={handleLocal}
                    >
                         {pythonSetupDone && !ocrReady && !ocrError && <div className='ocr-progress-bar' style={{ width: `${ocrProgress}%` }} />}
                         <span className='option-label'>Manga-OCR (++)</span>
                         <span className='option-desc'>{ocrDesc()}</span>
                    </button>
                    <button
                         className={`menu-option-button ${!isOnline ? 'offline' : ''}`}
                         onClick={() => isOnline && setSelected('groq')}
                    >
                         <span className='option-label'>Groq (+)</span>
                         <span className='option-desc'>
                              {isOnline ? t('GROQ_DESC', lang) : t('NO_INTERNET', lang)}
                         </span>
                    </button>
               </div>
               <p className='menu-made-by'>Made by <a className='menu-made-by-link' onClick={() => window.api.openExternal('https://github.com/isnotSenshi')}>sh1shn</a>{appVersion ? ` v${appVersion}` : ''}</p>
          </div>
     )
}

export default ConnectMenu
