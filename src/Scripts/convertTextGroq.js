import OpenAI from 'openai'

export const convertTextGroq = async (image, apiKey) => {
     const groq = new OpenAI({
          apiKey,
          baseURL: 'https://api.groq.com/openai/v1',
          dangerouslyAllowBrowser: false
     })

     const response = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
               role: 'user',
               content: [
                    {
                         type: 'text', text: `Te voy a pasar una imagen de un cuadro de texto de un manga japones, 
                         dame solo el texto en caracteres japoneses, sin explicacion ni nada extra. 
                         No escribas nada de mas, solo responde con el texto japonés que veas. 
                         Si la imagen no contiene texto japonés visible, respondé esto: (. . .)`
                    },
                    { type: 'image_url', image_url: { url: image } }
               ]
          }]
     })

     return response.choices[0].message.content
}
