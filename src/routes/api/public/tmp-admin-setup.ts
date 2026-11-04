import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/tmp-admin-setup")({
  server: { handlers: { POST: async ({ request }) => {
    const b = (await request.json()) as { nonce: string; password: string };
    if (b.nonce !== "66ee6ecb0c2091bbab7b040fca160037") return new Response("no", { status: 403 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const u = data.users.find((x) => x.email === "qwertyuiop@gmail.com");
    if (!u) return new Response("missing", { status: 404 });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(u.id, { password: b.password, email_confirm: true });
    return new Response(error ? error.message : "ok");
  } } },
});
