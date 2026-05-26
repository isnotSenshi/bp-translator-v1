import { OpenAI } from "openai"

export const convertTextOpenAi = async (image, apiKey) => {
     const openai = new OpenAI({ apiKey });

     const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
               {
                    role: "user",
                    content: [
                         {
                              type: 'text', text: `Te voy a pasar una imagen de un cuadro de texto de un manga japones, 
                         dame solo el texto en caracteres japoneses, sin explicacion ni nada extra. 
                         No escribas nada de mas, solo responde con el texto japonés que veas. 
                         Si la imagen no contiene texto japonés visible, respondé esto: (. . .)`
                         },
                         {
                              type: "image_url",
                              image_url: {
                                   url: `${image}`,
                              },
                         },
                    ],
               },
          ]
     });

     return response.choices[0].message.content
}

