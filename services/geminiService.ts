
import { GoogleGenAI } from "@google/genai";

export async function getStyleAdvice(userPrompt: string, imageData?: string) {
  // Verificação segura da API KEY para evitar crash do script
  let apiKey = '';
  try {
    apiKey = process?.env?.API_KEY || "";
  } catch (e) {
    console.warn("Ambiente de chaves de API não configurado.");
  }

  if (!apiKey) {
    return "O serviço de IA requer uma chave de API configurada. Por favor, verifique as configurações do servidor.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Você é um Consultor de Estilo Master da barbearia "Barba & Estilo".
    Seu objetivo é ajudar os clientes a escolherem o melhor corte de cabelo e estilo de barba.
    Responda com autoridade, elegância e um toque de modernidade.
    
    Se o usuário fornecer uma imagem, analise o formato do rosto e sugira cortes que valorizem seus traços.
    Se for apenas texto, pergunte sobre preferências e sugira estilos populares como Buzz Cut, Fade, Pompadour, ou Barba Lenhador.
    
    Tente sempre relacionar suas sugestões com os serviços: Corte Clássico, Barba de Respeito e Combo Master.
    Seja amigável e use emojis masculinos/estilo de barbearia ocasionalmente (✂️, 💈, 🧔).
  `;

  const parts: any[] = [{ text: userPrompt }];
  
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "Não consegui gerar uma resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, meu sistema de consultoria está temporariamente indisponível. Tente descrever seu estilo para nossos barbeiros pessoalmente!";
  }
}
