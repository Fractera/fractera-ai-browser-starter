// СЛОВА СТРАНИЦЫ «ДОБРО ПОЖАЛОВАТЬ» — В СВОЁМ `_i18n`, КАК У `settings`.
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-06: «данные маршруты должны иметь `_components`
// внутри себя, а не импортировать их из внешних источников». То же и со
// словами: раньше они жили константой ВНУТРИ компонента, а компонент — в общей
// папке `components/fractera/`. Теперь всё своё лежит рядом со своим маршрутом.

export type WelcomeUi = {
  title: string
  lead: string
  action: string
  /** Второй режим — вернуться на публичную главную (179). */
  home: string
  unavailable: string
}

// 🪦 СКОПИРОВАНО СО СЛУЖБЫ ЧАТА (179-1). Отличается ровно одним словом — лидом:
// у чата «Чат с ИИ-агентом доступен…», у памяти своё. Всё остальное совпадает
// намеренно: кнопки двух служб обязаны называться одинаково, иначе человек,
// вышедший из одной, читает вторую как другой продукт.
const DICT: Record<string, WelcomeUi> = {
  en: {
    title: "Sign in to start",
    lead: "The memory bench and the journal of its work are available after you sign in.",
    action: "Sign in or sign up",
    home: "Back to the home page",
    unavailable: "The sign-in service address is not configured yet.",
  },
  ru: {
    title: "Авторизуйтесь, чтобы начать",
    lead: "Стенд памяти и журнал её работы доступны после входа в проект.",
    action: "Войти или зарегистрироваться",
    home: "Вернуться на главную",
    unavailable: "Адрес службы входа пока не настроен.",
  },
}

/** Слова страницы. Незнакомый язык деградирует до английского, а не до пустоты. */
export function welcomeUi(lang: string): WelcomeUi {
  return DICT[lang] ?? DICT.en
}
