export const convertTextLocal = async (dataUrl) => {
  const response = await fetch('http://127.0.0.1:5001/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl })
  })
  if (!response.ok)
    throw new Error(`OCR local error: ${response.status}`)
  const { text } = await response.json()
  return text
}
