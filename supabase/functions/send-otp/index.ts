import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Número de teléfono requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending OTP to:", phone);
    
    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Invalidate previous OTPs for this phone number
    const { error: deleteError } = await supabase
      .from("phone_otps")
      .delete()
      .eq("phone_number", phone);
    
    if (deleteError) {
      console.error("Error deleting old OTPs:", deleteError);
    }
    
    // Save new OTP (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone_number: phone,
      otp_code: otpCode,
      expires_at: expiresAt,
    });
    
    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      throw new Error("Error guardando código de verificación");
    }
    
    // Send SMS via Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.error("Missing Twilio credentials");
      throw new Error("Configuración de SMS incompleta");
    }
    
    console.log("Sending SMS via Twilio...");
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioPhone,
          Body: `Tu código de verificación para Club Migrante es: ${otpCode}. Expira en 10 minutos.`,
        }),
      }
    );
    
    const twilioResult = await twilioResponse.json();
    console.log("Twilio response status:", twilioResponse.status);
    console.log("Twilio response:", JSON.stringify(twilioResult));
    
    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      throw new Error(twilioResult.message || "Error enviando SMS");
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Código enviado" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in send-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
