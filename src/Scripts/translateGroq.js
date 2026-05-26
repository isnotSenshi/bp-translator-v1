import OpenAI from 'openai'

export const translateTextGroq = async (apiKey, text, mustContext, story, lang = 'es') => {
     const groq = new OpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
          dangerouslyAllowBrowser: false
     })

     const target = lang === 'en' ? 'English' : 'Spanish'
     const confExample = lang === 'en' ? '...text (95%)' : '...texto (95%)'
     const transLabel = lang === 'en' ? 'Translation: ' : 'Traduccion: '

     const mensaje = mustContext
          ? `Context to consider: ${story}.
          Translate this Japanese text to ${target} only, considering the context. Start with '${transLabel}'.
          If the text doesn't make sense return '~' + closest match.\n\n${text}
          Then add a confidence percentage at the end, e.g.: ${confExample}`

          : `Translate this Japanese text to ${target}. Translation only, no quotes or extra explanations.
          If the text doesn't make sense return '~' + closest match.\n\n${text}
          Then add a confidence percentage at the end, e.g.: ${confExample}`

     const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: mensaje }]
     })

     return response.choices[0].message.content.trim()
}
