
import { GoogleGenAI } from "@google/genai";

export async function getStyleAdvice(userPrompt: string, imageData?: string) {
  // Inicialização dentro da função garante que o app carregue mesmo se a API KEY demorar a injetar
  const apiKey = process.env.API_KEY || "";
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

  const contents: any[] = [{ text: userPrompt }];
  
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "Não consegui gerar uma resposta. Tente descrever seu estilo de outra forma.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, meu sistema de consultoria está em manutenção no momento. Tente novamente em alguns minutos!";
  }
}
