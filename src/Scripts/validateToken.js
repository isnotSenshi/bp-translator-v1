import OpenAI from 'openai'

export const validarApiKey = async (apiKey) => {

     const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
     try {
          await client.chat.completions.create({
               model: "gpt-3.5-turbo",
               messages: [{ role: "user", content: "esto es una prueba" }],
               max_tokens: 5,
          })
          return true
     } catch (error) {
          return false
     }
}