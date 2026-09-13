import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { chatLang } from "@/lib/fractera/i18n";

export const metadata: Metadata = {
  description: "Автономная память для ИИ-агентов на вашем сервере.",
  // 🪦 ЗДЕСЬ СТОЯЛ `https://chat.vercel.ai` — ХВОСТ ВЕНДОРЕННОГО ЧАТА, и это
  // был настоящий дефект поиска: каждый относительный адрес в мете уводил на
  // чужой домен. Базы здесь больше нет вовсе: страницы объявляют её сами, от
  // хоста запроса (`lib/seo.ts`), потому что у каждого экземпляра он свой.
  title: "Fractera Memory",
};

export const viewport = {
  maximumScale: 1,
};

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🛑 ЯЗЫК ЗДЕСЬ НЕ РЕШАЕТСЯ, И ЭТО ИЗМЕРЕНО СБОРКОЙ, А НЕ ВЫБРАНО. Я поставил
  // сюда чтение `accept-language` — сборка отказала: у шаблона включён
  // `cacheComponents`, и любое обращение к заголовкам в корневой раскладке
  // делает динамическими ВСЕ страницы («Uncached data was accessed outside of
  // <Suspense>»). Язык выбирает островок по языку браузера; появится настройка
  // языка у человека — она станет единственным источником, и это будет одна
  // правка в `use-ui-lang`.
  return (
    // `scroll-smooth` — тот же приём, что у `<html>` стартера на 3000 (194-12, слово владельца: «ты забыл добавить
    // плавную прокрутку»). `motion-reduce:scroll-auto` — адаптация: у источника её нет, а плавность выключается
    // у того, кто попросил систему убрать движение.
    <html
      className={`${geist.variable} ${geistMono.variable} scroll-smooth motion-reduce:scroll-auto`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {/* 🪦 ЗДЕСЬ БЫЛ `SessionProvider` NextAuth — УДАЛЁН 2026-09-06 вместе со
              входом шаблона: он опрашивал `/api/auth/session`, маршрута которого
              больше нет. Человека узнаёт служба входа `:3001` на СЕРВЕРЕ, и
              клиентская сессия здесь не нужна вовсе. Восстанавливается из git. */}
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
