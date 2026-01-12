# Implementation Plan: Chrome Hub — Luxury Resale Store

## Overview

Пошаговая реализация переделки главной страницы под Chrome Hub с вертикальным слайдером товаров + Backend и Admin Panel.

## Tasks

### Phase 1: Frontend (Homepage)

- [x] 1. Подготовка структуры проекта
  - [x] 1.1 Создать папки для новых компонентов
  - [x] 1.2 Обновить globals.css с новыми CSS переменными

- [x] 2. Модификация DotMatrix компонента
  - [x] 2.1 Добавить prop `fixed` для фиксированного позиционирования

- [x] 3. Создание компонентов главной страницы
  - [x] 3.1 ProductCard с квадратным фото, ценой, размерами
  - [x] 3.2 VerticalSlider с scroll-snap и GSAP
  - [x] 3.3 Minimap (React версия) с навигацией
  - [x] 3.4 FilterSidebar (открывается слева как корзина)

- [x] 4. Переделка главной страницы
  - [x] 4.1 Убрать Menu и Footer с главной
  - [x] 4.2 Добавить фиксированный DotMatrix
  - [x] 4.3 Добавить VerticalSlider + Minimap
  - [x] 4.4 Скрыть кнопку корзины на главной

### Phase 2: Backend Setup

- [x] 5. Supabase интеграция
  - [x] 5.1 Создать supabase client (`src/lib/supabase.js`)
  - [x] 5.2 Создать SQL схему (`supabase/schema.sql`)
  - [x] 5.3 Добавить `.env.local.example`

### Phase 3: Admin Panel

- [x] 6. Admin Layout и навигация
  - [x] 6.1 Создать `/admin` layout с sidebar
  - [x] 6.2 AdminSidebar компонент
  - [x] 6.3 Admin CSS (стиль как у основного сайта)

- [x] 7. Dashboard
  - [x] 7.1 Статистика (товары, заказы, клиенты, выручка)
  - [x] 7.2 Последние заказы

- [x] 8. Products Management
  - [x] 8.1 Список товаров с фильтрами
  - [x] 8.2 ProductForm компонент (images, sizes, categories)
  - [x] 8.3 Страница создания товара
  - [x] 8.4 Страница редактирования товара

- [x] 9. Orders Management
  - [x] 9.1 Список заказов с фильтрами по статусу
  - [x] 9.2 Детальная страница заказа
  - [x] 9.3 Изменение статуса заказа
  - [x] 9.4 История статусов

- [x] 10. Clients Management
  - [x] 10.1 Список клиентов с фильтрами по tier
  - [x] 10.2 Детальная страница клиента
  - [x] 10.3 История заказов клиента
  - [x] 10.4 Wishlist и просмотры

- [x] 11. Analytics
  - [x] 11.1 Ключевые метрики (revenue, AOV, LTV)
  - [x] 11.2 Top Products
  - [x] 11.3 Top Clients
  - [x] 11.4 Category Performance

- [x] 12. Settings
  - [x] 12.1 Store Information
  - [x] 12.2 Telegram Integration settings
  - [x] 12.3 Notifications settings
  - [x] 12.4 Business Rules

### Phase 4: Integrations (TODO)

- [ ] 13. Telegram Bot
  - [ ] 13.1 Создать API route для webhook
  - [ ] 13.2 Уведомления о новых заказах
  - [ ] 13.3 Команды для управления заказами

- [x] 14. Frontend-Backend Connection
  - [x] 14.1 Подключить главную к Supabase
  - [x] 14.2 Realtime обновления статуса товаров
  - [x] 14.3 Корзина с новой структурой данных
  - [x] 14.4 Сервисы для products, orders, clients

## Notes

- Admin доступен по `/admin` без авторизации (временно)
- Demo данные показываются когда Supabase не настроен
- Minimap баг с индикатором исправлен
- Корзина теперь сохраняется в localStorage
