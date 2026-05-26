export const strings = {
  es: {
    // App
    MAIN_INTRO: 'Intenta con la herramienta recortar, cuando lo tengas yo hago la traduccion... ',

    // ConnectMenu
    MENU_TITLE: 'Selecciona el motor de Traducción',
    OPENAI_DESC: 'GPT-4o-mini · Requiere API key de pago',
    NO_INTERNET: 'Sin conexión a internet',
    LOCAL_SETUP_FIRST: 'Configurar motor local · primera vez',
    LOCAL_READY: 'OCR - Gratis y Local',
    LOCAL_LOADING: 'Cargando modelo...',
    LOCAL_NO_PYTHON: 'Requiere Python instalado · python.org',
    LOCAL_MISSING_DEPS: 'Faltan dependencias · ejecutá npm run setup:ocr',
    LOCAL_ERROR: 'El servidor OCR falló al iniciar',
    GROQ_DESC: 'Llama 3 · Gratis con cuenta de Groq',

    // SetupScreen
    SETUP_TITLE: 'Configurar Manga-OCR',
    SETUP_SEARCHING: 'Buscando Python en el sistema...',
    SETUP_DONE: '¡Todo listo! Cargando modelo OCR...',
    SETUP_CANCEL: 'Cancelar',
    SETUP_RETRY: 'Reintentar',
    SETUP_BACK: 'Volver',
    SETUP_ERROR_HINT_PRE: 'O instalá Python manualmente desde',
    SETUP_ERROR_HINT_SUF: 'y luego ejecutá',

    // DialogContainer
    CTX_OFF: 'sin contexto',
    CTX_ON: '+ contexto',
    CTX_PLACEHOLDER: 'Contexto de la traduccion...',

    // ConnectOpenAi / ConnectGroq
    BACK: '← Volver',
    VALIDATE: 'Validar',
    OPENAI_HINT: 'Obtené tu API key en',
    OPENAI_INPUT: 'Ingrese OpenAi Api Token',
    GROQ_HINT: 'Obtené tu API key gratis en',
    GROQ_INPUT: 'Ingrese Groq Api Key',

    // MainButtons
    BTN_ENGINE: 'Motor',

    // IPC messages
    NO_TEXT_FOUND: 'No se detectó texto en la imagen.',
    LOCAL_OCR_ERROR: 'Error en OCR local: ',
    TRANSLATE_ERROR: 'Error al traducir: ',
  },
  en: {
    // App
    MAIN_INTRO: "Try the crop tool, once you have it I'll handle the translation... ",

    // ConnectMenu
    MENU_TITLE: 'Select Translation Engine',
    OPENAI_DESC: 'GPT-4o-mini · Requires paid API key',
    NO_INTERNET: 'No internet connection',
    LOCAL_SETUP_FIRST: 'Set up local engine · first time',
    LOCAL_READY: 'OCR - Free & Local',
    LOCAL_LOADING: 'Loading model...',
    LOCAL_NO_PYTHON: 'Python required · python.org',
    LOCAL_MISSING_DEPS: 'Missing dependencies · run npm run setup:ocr',
    LOCAL_ERROR: 'OCR server failed to start',
    GROQ_DESC: 'Llama 3 · Free with Groq account',

    // SetupScreen
    SETUP_TITLE: 'Setup Manga-OCR',
    SETUP_SEARCHING: 'Looking for Python on your system...',
    SETUP_DONE: 'All done! Loading OCR model...',
    SETUP_CANCEL: 'Cancel',
    SETUP_RETRY: 'Retry',
    SETUP_BACK: 'Back',
    SETUP_ERROR_HINT_PRE: 'Or install Python manually from',
    SETUP_ERROR_HINT_SUF: 'and then run',

    // DialogContainer
    CTX_OFF: 'no context',
    CTX_ON: '+ context',
    CTX_PLACEHOLDER: 'Translation context...',

    // ConnectOpenAi / ConnectGroq
    BACK: '← Back',
    VALIDATE: 'Validate',
    OPENAI_HINT: 'Get your API key at',
    OPENAI_INPUT: 'Enter OpenAi API Token',
    GROQ_HINT: 'Get your free API key at',
    GROQ_INPUT: 'Enter Groq API Key',

    // MainButtons
    BTN_ENGINE: 'Engine',

    // IPC messages
    NO_TEXT_FOUND: 'No text detected in the image.',
    LOCAL_OCR_ERROR: 'Local OCR error: ',
    TRANSLATE_ERROR: 'Translation error: ',
  }
}
