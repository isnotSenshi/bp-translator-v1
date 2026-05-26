import React, { useEffect, useState } from "react";
import './TextHistory.css'

const stripPercent = (text) => text.replace(/\s*\(\d+%\)\s*$/, '').trim()

export const TextHistory = () => {
     const [history, setTextHistory] = useState([])
     const [historyNT, setTextHistoryNT] = useState([])
     const [copiedKey, setCopiedKey] = useState(null)

     useEffect(() => {
          window.api.onStateChanged((clave, valor) => {
               if (String(clave) == 'textHistory') setTextHistory(valor)
               if (String(clave) == 'textHistoryNT') setTextHistoryNT(valor)
          })
     }, [])

     const handleCopy = (e, key, text) => {
          e.stopPropagation()
          navigator.clipboard.writeText(text)
          setCopiedKey(key)
          setTimeout(() => setCopiedKey(null), 500)
     }

     const reversed = history.slice().reverse()

     return (
          <div className='text-history'>
               {reversed.map((text, i) => {
                    const realIndex = history.length - 1 - i
                    const nt = historyNT[realIndex]
                    const keyEs = `${i}-es`
                    const keyJa = `${i}-ja`
                    return (
                         <div key={'history-item-' + i} className='history-item'>
                              <h2
                                   className={`normal-text copyable ${copiedKey === keyEs ? 'copied' : ''}`}
                                   onClick={(e) => handleCopy(e, keyEs, stripPercent(text))}
                              >
                                   {' > ' + text}
                              </h2>
                              <h3
                                   className={`normal-sub-text copyable ${copiedKey === keyJa ? 'copied' : ''}`}
                                   onClick={(e) => handleCopy(e, keyJa, nt)}
                              >
                                   {'( ' + nt + ' )'}
                              </h3>
                         </div>
                    )
               })}
          </div>
     )
}
