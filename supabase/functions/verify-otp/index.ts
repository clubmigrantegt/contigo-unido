import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { phone, code, fullName } = await req.json();
    
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ success: false, error: "Teléfono y código requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying OTP for:", phone);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone_number", phone)
      .eq("otp_code", code)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .single();
    
    if (otpError || !otpRecord) {
      console.log("OTP validation failed:", otpError);
      return new Response(
        JSON.stringify({ success: false, error: "Código inválido o expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Mark OTP as verified
    await supabase
      .from("phone_otps")
      .update({ verified: true })
      .eq("id", otpRecord.id);
    
    // Create a fake email for this phone user
    const fakeEmail = `${phone.replace(/[^0-9]/g, "")}@phone.clubmigrante.app`;
    const tempPassword = crypto.randomUUID();
    
    // Check if user exists by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let user = existingUsers?.users.find(u => u.email === fakeEmail || u.phone === phone);
    
    if (!user) {
      console.log("Creating new user for phone:", phone);
      
      // Create new user with email and phone
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: fakeEmail,
        email_confirm: true,
        phone,
        phone_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: fullName || "Usuario" }
      });
      
      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }
      
      user = newUser.user;
      
      // Create profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: fullName || "Usuario",
        phone_number: phone
      });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    } else {
      console.log("User exists, updating password");
      
      // Update user password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: tempPassword
      });
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
        throw updateError;
      }
      
      // Update profile if name provided
      if (fullName) {
        await supabase.from("profiles").upsert({
          user_id: user.id,
          full_name: fullName,
          phone_number: phone
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user.id,
        email: fakeEmail,
        tempPassword,
        message: "Verificación exitosa"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
