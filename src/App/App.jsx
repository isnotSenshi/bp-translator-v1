import React, { useEffect, useRef, useState } from 'react'
import MainButtons from '../Components/MainButtons/MainButtons'
import './App.css'
import { constants } from './../Constants/index'
import ConnectMenu from '../Components/ConnectMenu/ConnectMenu'
import LangSelect from '../Components/LangSelect/LangSelect'
import { DialogContainer } from '../Components/DialogContainer/DialogContainer'
import { TextHistory } from '../Components/TextHistory/TextHistory'
import { mainTextIntro } from '../Utils/appState.js'
import { t } from '../Utils/i18n.js'

const App = () => {
     const [lang, setLang] = useState(null)
     const langRef = useRef(null)
     const [bPants, setBpants] = useState('../assets/bPants/Burgerpants.webp')
     const [connect, setConnect] = useState(false)
     const [text, setText] = useState(mainTextIntro)

     useEffect(() => {
          window.api.onStateChanged((clave, valor) => {
               if (String(clave) == 'currentBpants') {
                    setBpants(valor)
               }
               if (String(clave) == 'queryText') {
                    if (valor !== '')
                         setText(valor)
               }
               if (String(clave) == 'mainText') {
                    if (valor === mainTextIntro) {
                         setText(t('MAIN_INTRO', langRef.current || 'es'))
                    } else {
                         setText(valor)
                    }
               }
               if (String(clave) == 'storyContext') {
                    setConnect(valor !== null)
               }
          })
     }, [])

     const handleLangSelect = (selectedLang) => {
          setLang(selectedLang)
          langRef.current = selectedLang
          window.api.setState('lang', selectedLang)
     }

     const displayText = text === mainTextIntro ? t('MAIN_INTRO', lang) : text

     return (
          <div className="app-container">
               <div className="app-inner">
                    {connect && <MainButtons />}
                    <div className="dialog-inner">
                         {!lang
                              ? <LangSelect onSelect={handleLangSelect} />
                              : connect
                                   ? <>
                                        <DialogContainer bPants={bPants} typoWr={constants.typeWritterConfig(displayText)} />
                                        <TextHistory />
                                   </>
                                   : <ConnectMenu lang={lang} onBack={() => setLang(null)} />
                         }
                    </div>
               </div>
          </div>
     )
}

export default App
