import React from "react";

export const Button = ({ item, onSnapCrop, setText, croppedImage, uniqKey, lang }) => {

     const validateSrcTwo = (alt, src, src2) => {
          if (alt == 'Scan') {
               if (croppedImage)
                    return false
               else
                    return true
          }

          return true
     }

     return (
          <div className={item.alt === 'Scan' && !croppedImage ? 'main-button-disabled' : 'main-button'}
               onClick={item.alt === 'Crop' ? () => onSnapCrop() : () => item.func()}
               onMouseOver={() => setText(lang === 'en' ? item.alt : item.text)}
               onMouseOut={() => setText('-')}
               key={uniqKey + '-button'}>
               <img
                    className="main-button-img"
                    src={validateSrcTwo(item.alt, item.src, item.src2) ? item.src : item.src2}
                    draggable={false}
                    alt={item.alt}
                    key={uniqKey + '-img-button'}
               />
          </div>)
}