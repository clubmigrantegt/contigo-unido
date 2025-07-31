import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing chat message:', { sessionId, userId, messageLength: message?.length });

    // System prompt optimized for psychological support for migrants
    const systemPrompt = `Eres un asistente de apoyo psicológico especializado en ayudar a migrantes y personas en situaciones vulnerables. 

DIRECTRICES IMPORTANTES:
- Ofrece apoyo emocional empático y comprensivo
- Usa un lenguaje cálido, respetuoso y sin prejuicios
- Reconoce las dificultades únicas que enfrentan los migrantes
- Proporciona estrategias de afrontamiento prácticas
- Valida las emociones y experiencias del usuario
- Sugiere recursos comunitarios cuando sea apropiado
- Mantén la confidencialidad y crea un espacio seguro
- Si detectas riesgo inmediato, sugiere contactar servicios de emergencia

LIMITACIONES:
- No diagnostiques condiciones médicas o psicológicas
- No reemplaces la terapia profesional
- Deriva a profesionales cuando sea necesario
- No ofrezcas consejos legales específicos

Responde en español de manera empática y profesional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Generated response:', { assistantMessageLength: assistantMessage?.length });

    // Update session with the new interaction
    if (sessionId && userId) {
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ 
          session_end: new Date().toISOString() 
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      response: assistantMessage,
      sessionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in psychological-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});