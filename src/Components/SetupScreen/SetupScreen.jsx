import React, { useState, useEffect, useRef } from 'react'
import './SetupScreen.css'
import { t } from '../../Utils/i18n.js'

const SetupScreen = ({ onBack, onComplete, lang }) => {
  const [percent, setPercent] = useState(0)
  const [message, setMessage] = useState(t('SETUP_SEARCHING', lang))
  const [error, setError] = useState(null)
  const crawlRef = useRef(null)

  const startCrawl = (from, to, durationMs) => {
    if (crawlRef.current) clearInterval(crawlRef.current)
    const steps = durationMs / 200
    const increment = (to - from) / steps
    let current = from
    crawlRef.current = setInterval(() => {
      current = Math.min(current + increment, to)
      setPercent(Math.floor(current))
      if (current >= to) clearInterval(crawlRef.current)
    }, 200)
  }

  useEffect(() => {
    window.api.onSetupProgress(({ percent: p, message: m }) => {
      if (p !== null && p !== undefined) {
        if (crawlRef.current) clearInterval(crawlRef.current)
        setPercent(p)
        if (p === 30 || p === 32) startCrawl(p, 90, 8 * 60 * 1000)
      }
      setMessage(m)
    })

    window.api.onSetupDone(() => {
      if (crawlRef.current) clearInterval(crawlRef.current)
      setPercent(100)
      setMessage(t('SETUP_DONE', lang))
      setTimeout(() => onComplete?.(), 1200)
    })

    window.api.onSetupError((msg) => {
      if (crawlRef.current) clearInterval(crawlRef.current)
      setError(msg)
    })

    window.api.runSetup()

    return () => { if (crawlRef.current) clearInterval(crawlRef.current) }
  }, [])

  const handleRetry = () => {
    setError(null)
    setPercent(0)
    setMessage(t('SETUP_SEARCHING', lang))
    window.api.runSetup()
  }

  return (
    <div className='mainWindow'>
      <img
        src='../assets/icons/icons8-close-48.png'
        className='close-button'
        onClick={() => window.api.closeWindow()}
      />
      <div className='setup-container'>
        <p className='setup-title'>{t('SETUP_TITLE', lang)}</p>

        {!error && (
          <>
            <p className='setup-message'>{message}</p>
            <div className='setup-bar-bg'>
              <div className='setup-bar-fill' style={{ width: `${percent}%` }} />
            </div>
            {percent < 100 && (
              <button className='setup-btn-secondary' onClick={onBack}>
                {t('SETUP_CANCEL', lang)}
              </button>
            )}
          </>
        )}

        {error && (
          <>
            <p className='setup-error'>{error}</p>
            <div className='setup-actions'>
              <button className='setup-btn-primary' onClick={handleRetry}>
                {t('SETUP_RETRY', lang)}
              </button>
              <button className='setup-btn-secondary' onClick={onBack}>
                {t('SETUP_BACK', lang)}
              </button>
            </div>
            <p className='setup-error-hint'>
              {t('SETUP_ERROR_HINT_PRE', lang)}{' '}
              <span onClick={() => window.api.openExternal('https://python.org')}>
                python.org
              </span>{' '}
              {t('SETUP_ERROR_HINT_SUF', lang)} <code>npm run setup:ocr</code>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default SetupScreen
