import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization")!;
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // SECURITY: Whitelist check
        // ⚠️ REPLACE WITH YOUR ACTUAL ADMIN EMAIL(S) ⚠️
        const ALLOWED_ADMINS = ["ciaran.madigan@circet.ie", "ciaranmadigan@gmail.com"];

        if (!ALLOWED_ADMINS.includes(user.email ?? "")) {
            return new Response(
                JSON.stringify({ error: "Forbidden: You are not an admin." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const adminClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { action, email, password, userId } = await req.json();

        if (action === "create") {
            const { data, error } = await adminClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            });

            if (!error && data.user) {
                await adminClient.from("user_profiles").insert({
                    id: data.user.id,
                    email,
                    role: 'admin',
                    must_reset_password: true,
                    created_by: user.id,
                });
            }

            return new Response(
                JSON.stringify({ data, error }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (action === "delete") {
            const { error } = await adminClient.auth.admin.deleteUser(userId);
            return new Response(
                JSON.stringify({ error }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (action === "list") {
            const { data, error } = await adminClient
                .from("user_profiles")
                .select("*")
                .order("created_at", { ascending: false });

            return new Response(
                JSON.stringify({ data, error }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ error: "Invalid action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
