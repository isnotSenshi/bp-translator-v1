import React, { useEffect, useState } from 'react';
import './MainButtons.css';
import { constants } from '../../Constants';
import { Button } from './Button';
import { t } from '../../Utils/i18n.js';

const MainButtons = () => {
     const [text, setText] = useState('-')
     const [croppedImage, setCroppedImage] = useState(false)
     const [lang, setLang] = useState('es')

     const onSnapCrop = async () => {
          const screenshot = await window.api.captureScreen()
          const cropped = await window.api.openCropWindow(screenshot)
          window.api.setState('currentBpants', '../assets/bPants/Burgerpants2.webp')
          await window.api.saveImageToRoot(cropped)
     }

     useEffect(() => {
          window.api.getState('lang').then(l => { if (l) setLang(l) })
          window.api.onStateChanged((clave, valor) => {
               if (String(clave) == 'croppedImage') setCroppedImage(valor)
               if (String(clave) == 'lang') setLang(valor)
          })

          window.api.onShortcut((action) => {
               if (action === 'capture') onSnapCrop()
               if (action === 'translate') window.api.translateText()
               if (action === 'save') window.api.addTextHistory()
               if (action === 'undo') window.api.undoHistory()
          })
     }, [])

     const goToMenu = () => {
          window.api.setState('storyContext', null)
     }

     return (
          <div className="main-buttons-container">
               <img src={'../assets/icons/icons8-move-96.png'} className='drag-button'/>
               {constants.buttons.map((item, i) => (
                    <Button item={item} onSnapCrop={onSnapCrop} setText={setText} croppedImage={croppedImage} uniqKey={i} lang={lang} />
               ))}
               <div className='main-button' onClick={goToMenu} onMouseOver={() => setText(t('BTN_ENGINE', lang))} onMouseOut={() => setText('-')}>
                    <img className='main-button-img' src='../assets/icons/icons8-bot-96.png' draggable={false} alt='Engine' />
               </div>
               <div className='tool-help-text'>
                    {text}
               </div>
          </div>
     );
};

export default MainButtons;
