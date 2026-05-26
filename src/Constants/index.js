export const constants = {
     buttons: [
          {
               text: 'Cerrar',
               alt: 'Close',
               src: '../assets/icons/icons8-close-48.png',
               func: () => window.api.closeWindow()
          },
          {
               text: 'Borrar',
               alt: 'Delete',
               src: '../assets/icons/icons8-trash-96.png',
               func: () => window.api.restart()
          },
          {
               text: 'Recortar',
               alt: 'Crop',
               src: '../assets/icons/icons8-crop-48.png',
               func: null
          },
          {
               text: 'Traducir',
               alt: 'Translate',
               src: '../assets/icons/icons8-ocr-96.png',
               func: () => window.api.translateText()
          },
          {
               text: 'Agregar',
               alt: 'Add',
               src: '../assets/icons/icons8-save-as-96.png',
               func: () => window.api.addTextHistory()
          },
          {
               text: 'Sustraer',
               alt: 'Undo',
               src: '../assets/icons/icons8-undo-96.png',
               func: () => window.api.undoHistory()
          },
     ],
     typeWritterConfig: (text) => ({
          strings: [text],
          autoStart: true,
          loop: false,
          delay: 15,
          deleteSpeed: 9999999999
     })
}