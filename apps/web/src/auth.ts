import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

async function sendTelegramLogin(email: string, role: string, success: boolean) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[telegram] Not configured. TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing.");
    return;
  }

  console.log("[telegram] signIn event -> sending message", {
    email,
    role,
    success,
  });
  const now = new Date().toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "short",
    timeStyle: "short",
  });
  const roleEmoji: Record<string, string> = { ADMIN: "🛠️", VENDOR: "🏭", CONSUMER: "👤" };
  const msg = success
    ? `${roleEmoji[role] ?? "👤"} *Nueva sesión iniciada*\nEmail: \`${email}\`\nRol: ${role}\n🕐 ${now}`
    : `⚠️ *Intento de login fallido*\nEmail: \`${email}\`\n🕐 ${now}`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" }),
    });
    const body = await res.json() as { ok: boolean; description?: string };
    if (!body.ok) {
      console.error("[telegram] Error API:", body.description);
    } else {
      console.log("[telegram] Message sent OK", { messageId: body.result?.message_id });
    }
  } catch (err) {
    console.error("[telegram] Excepción:", err);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  events: {
    async signIn({ user }) {
      const email = user.email ?? "desconocido";
      const role = (user as { roles?: string[] }).roles?.[0] ?? "CONSUMER";
      await sendTelegramLogin(email, role, true);
    },
  },
});
