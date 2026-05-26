export const translateTextLocal = async (text, lang = 'es') => {
  const response = await fetch('http://127.0.0.1:5001/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang })
  })
  if (!response.ok) throw new Error(`Translation local error: ${response.status}`)
  const { text: translated } = await response.json()
  return translated
}
