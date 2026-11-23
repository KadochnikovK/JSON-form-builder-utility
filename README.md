# JSON Form Builder

Визуальный конструктор форм на базе JSON Forms (этап 1 / MVP по ТЗ —
см. `SPEC-json-form-builder.md`).

## Запуск

```bash
npm install
npm run dev
```

Приложение откроется на http://localhost:5173.

## Скрипты

- `npm run dev` — dev-сервер
- `npm run build` — проверка типов + production-сборка
- `npm test` — юнит-тесты document-model (Vitest)

## Что умеет MVP

- Палитра: text, textarea, number, date, slider, checkbox, select, radio +
  секции vertical / horizontal / group / tabs
- Drag-and-drop с точной вставкой между элементами и вложенностью (dnd-kit)
- Инспектор свойств: label, name, description, placeholder, required,
  дефолт, варианты; дополнительно — format, pattern с живой проверкой,
  min/max/step, minLength/maxLength, readOnly
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z), дублирование и удаление элементов
- Экспорт JSON Schema / UI Schema / полного проекта (скачать или копировать)
- Проекты: автосохранение + именованные проекты в localStorage
- Превью на vanilla-рендерерах JSON Forms с валидацией AJV и панелью данных
- Интерфейс RU/EN (переключатель в тулбаре)
