/**
 * Utilitário para enviar mensagens para o Telegram
 * 
 * Este arquivo contém funções para enviar mensagens para canais do Telegram
 * quando novos posts são criados no blog.
 */

type TelegramOptions = {
  botToken: string;
  chatId: string;
};

/**
 * Envia uma mensagem para um canal do Telegram
 * 
 * @param options Configurações do Telegram (token do bot e ID do chat)
 * @param message Mensagem a ser enviada
 * @returns Resposta da API do Telegram
 */
export async function sendTelegramMessage(
  options: TelegramOptions, 
  message: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const apiUrl = `https://api.telegram.org/bot${options.botToken}/sendMessage`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: options.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.description || 'Erro ao enviar mensagem para o Telegram');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Envia uma notificação de novo post para o canal do Telegram
 * 
 * @param post Dados do post
 * @returns Resultado do envio
 */
export async function notifyNewPost(post: { 
  title: string; 
  excerpt: string; 
  slug: string;
}): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  
  if (!botToken || !chatId) {
    console.warn('Configurações do Telegram não encontradas. Ignorando notificação.');
    return { success: false, error: 'Configurações do Telegram não encontradas' };
  }
  
  // Usar a URL do site a partir das variáveis de ambiente, com fallback para o valor padrão
  const blogUrl = 'https://madua.com.br';
  
  // Construir URL do post verificando se o slug já tem estrutura completa
  let postUrl;
  if (post.slug.startsWith('http')) {
    // Se o slug já é uma URL completa, usar diretamente
    postUrl = post.slug;
  } else {
    // Caso contrário, construir a URL normalmente
    postUrl = `${blogUrl}/noticias/${post.slug}`;
  }
  
  console.log(`Enviando notificação para o Telegram com URL: ${postUrl}`);
  
  // Formatação HTML com quebras de linha explícitas e link clicável
  const message = `
📰 <b>${post.title}</b>

${post.excerpt}

<a href="${postUrl}">👉 Clique aqui para ler mais</a>
@maduabrasil
`.trim();

  return await sendTelegramMessage(
    { botToken, chatId },
    message
  );
} 