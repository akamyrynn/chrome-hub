# Requirements Document

## Introduction

Полноценная backend-система для luxury resale магазина "Chrome Hub". Включает расширенное управление товарами с multi-layer галереей, премиальную CRM с clienteling, интеграцию мессенджеров, управление примерками и VIP-доставкой, аналитику LTV/CAC.

## Glossary

- **Store**: Основное приложение магазина "Chrome Hub"
- **Product**: Товар с расширенными атрибутами и медиа-контентом
- **Main_Image**: Заглавное фото для каталога и слайдера
- **Gallery**: Multi-layer галерея с High-Res фото, 360° вьюером и видео
- **Care_Info**: Информация по уходу за товаром
- **Brand_Story**: История бренда и конкретной вещи
- **Category/Subcategory**: Иерархия категорий товаров
- **Order**: Заказ с расширенными статусами включая примерку
- **Client_Card**: Карточка клиента с полной историей взаимодействий
- **Wishlist**: Список желаний клиента с аналитикой
- **Waitlist**: Очередь ожидания на дефицитные позиции
- **LTV**: Lifetime Value — пожизненная ценность клиента
- **CAC**: Customer Acquisition Cost — стоимость привлечения
- **White_Glove_Delivery**: Премиальная доставка с VIP-курьерами
- **Fitting**: Выездная примерка товаров
- **Invoice**: Счёт с возможностью индивидуальной цены
- **Supabase**: Backend с Realtime для мгновенной синхронизации
- **Admin**: Админ-панель в стиле основного сайта

---

## PHASE 1: Core Product Management

### Requirement 1: Управление товарами — Медиа-галерея

**User Story:** As an admin, I want to upload rich media content, so that luxury clients can examine products in detail.

#### Acceptance Criteria

1. THE Admin SHALL be able to upload multiple High-Res images (up to 15)
2. THE Admin SHALL be able to select one image as Main_Image for catalog/slider
3. THE Admin SHALL be able to upload video covers for products
4. THE Admin SHALL be able to set sort order for gallery images
5. THE Store SHALL support 360° viewer for products (future: integration ready)
6. WHEN uploading images THEN THE Store SHALL generate optimized thumbnails
7. THE Store SHALL store original High-Res versions for zoom functionality

### Requirement 2: Управление товарами — Параметры

**User Story:** As an admin, I want to set comprehensive product attributes.

#### Acceptance Criteria

1. THE Admin SHALL set: brand, product name, price (EUR), sizes array
2. THE Admin SHALL set: Category and Subcategory
3. THE Admin SHALL set: product description (rich text)
4. THE Admin SHALL set: Care_Info — инструкции по уходу
5. THE Admin SHALL set: Brand_Story — история бренда/вещи
6. THE Admin SHALL set: condition (new, like new, excellent, good)
7. THE Admin SHALL set: authenticity details and certificates
8. THE Admin SHALL mark product status: available, reserved, sold
9. WHEN storing data THEN THE Store SHALL encode arrays using JSON

### Requirement 3: Категории и подкатегории

**User Story:** As a user, I want to browse by category hierarchy.

#### Acceptance Criteria

1. Categories: Clothing, Accessories, Jewelry, Shoes, Bags, Watches
2. Clothing subcategories: Jackets, Pants, Shirts, Hoodies, T-Shirts, Dresses, Coats
3. Accessories subcategories: Belts, Wallets, Scarves, Hats, Sunglasses, Keychains
4. Jewelry subcategories: Rings, Necklaces, Bracelets, Earrings, Pendants, Brooches
5. Shoes subcategories: Sneakers, Boots, Loafers, Sandals, Heels
6. Bags subcategories: Handbags, Backpacks, Clutches, Totes, Crossbody
7. Watches subcategories: Automatic, Quartz, Smart, Vintage

### Requirement 4: Inventory Realtime Sync

**User Story:** As an admin, I want instant inventory sync, so that we never sell the same item twice.

#### Acceptance Criteria

1. THE Store SHALL use Supabase Realtime for inventory updates
2. WHEN product status changes THEN ALL connected clients SHALL see update instantly
3. WHEN product is added to cart THEN THE Store SHALL create temporary reservation
4. IF reservation expires (15 min) THEN THE Store SHALL release the item
5. WHEN order is confirmed THEN THE Store SHALL mark product as sold immediately
6. THE Admin SHALL see real-time inventory dashboard

---

## PHASE 2: CRM & Clienteling

### Requirement 5: Карточка клиента (Client Card)

**User Story:** As an admin, I want full client history, so that I can provide personalized service.

#### Acceptance Criteria

1. THE CRM SHALL store: name, phone, email, addresses, notes
2. THE CRM SHALL track: purchase history with dates and amounts
3. THE CRM SHALL track: product view history (last 100 items)
4. THE CRM SHALL track: abandoned carts with items
5. THE CRM SHALL track: wishlist items
6. THE CRM SHALL calculate and display client LTV
7. THE CRM SHALL show client tier: New, Regular, VIP, VVIP (based on LTV)

### Requirement 6: Wishlist Analytics

**User Story:** As an admin, I want wishlist insights, so that I can drive conversions.

#### Acceptance Criteria

1. THE Store SHALL allow clients to add items to wishlist
2. THE CRM SHALL show most wishlisted products ranking
3. THE CRM SHALL show wishlist-to-purchase conversion rate
4. THE Admin SHALL be able to send personalized offers to wishlist holders
5. WHEN wishlisted item goes on sale THEN THE Store SHALL notify client

### Requirement 7: Waitlist Management

**User Story:** As an admin, I want to manage waitlists for rare items.

#### Acceptance Criteria

1. THE Store SHALL allow clients to join waitlist for sold/reserved items
2. THE CRM SHALL rank waitlist by client LTV automatically
3. WHEN item becomes available THEN THE Store SHALL notify top waitlist client
4. THE Admin SHALL see waitlist queue with client LTV scores
5. THE Admin SHALL be able to manually prioritize waitlist entries

---

## PHASE 3: Order Management

### Requirement 8: Статусы заказов (Extended)

**User Story:** As an admin, I want comprehensive order tracking including fittings.

#### Acceptance Criteria

1. Order statuses: new, confirmed, preparing, fitting, partial_buyout, shipping, delivered, returned
2. Fitting statuses: scheduled, with_courier, on_fitting, completed
3. WHEN status changes THEN THE CRM SHALL record timestamp and admin who changed
4. THE CRM SHALL display orders grouped by status with counts
5. THE Admin SHALL add notes to each status change

### Requirement 9: Управление примеркой (Fitting)

**User Story:** As an admin, I want to manage home fittings for VIP clients.

#### Acceptance Criteria

1. THE Admin SHALL schedule fitting with date, time, address
2. THE Admin SHALL assign courier to fitting
3. Fitting statuses: "у курьера", "на примерке", "частичный выкуп", "полный выкуп", "возврат"
4. THE Admin SHALL mark which items were bought after fitting
5. THE CRM SHALL track fitting conversion rate per client

### Requirement 10: Индивидуальные цены (Custom Pricing)

**User Story:** As an admin, I want to offer custom prices to specific clients.

#### Acceptance Criteria

1. THE Admin SHALL be able to create Invoice with custom prices
2. THE Admin SHALL apply percentage or fixed discount per item
3. THE Invoice SHALL generate unique payment link
4. THE CRM SHALL track discount history per client
5. THE Admin SHALL set discount reason/note

---

## PHASE 4: Integrations

### Requirement 11: Telegram интеграция

**User Story:** As an admin, I want Telegram notifications and management.

#### Acceptance Criteria

1. WHEN new order created THEN THE Bot SHALL send notification with details
2. THE Bot SHALL provide inline buttons to change order status
3. THE Bot SHALL support commands: /orders, /order {id}, /client {id}
4. WHEN order status changes THEN THE Bot SHALL notify admin chat
5. THE Admin SHALL configure multiple Telegram chat IDs for different notification types

### Requirement 12: Messenger Integration (Ticket System)

**User Story:** As an admin, I want to see all client communications in one place.

#### Acceptance Criteria

1. THE CRM SHALL integrate WhatsApp conversation history (via API)
2. THE CRM SHALL integrate Telegram conversation history
3. THE CRM SHALL display messages in client card timeline
4. THE Admin SHALL be able to reply from CRM interface
5. THE CRM SHALL link messages to specific orders when possible

### Requirement 13: White Glove Delivery

**User Story:** As an admin, I want to manage premium delivery with VIP couriers.

#### Acceptance Criteria

1. THE Admin SHALL assign VIP courier to order
2. THE Admin SHALL track courier location (manual updates)
3. THE CRM SHALL store courier profiles with ratings
4. THE Admin SHALL schedule delivery time windows
5. THE Client SHALL receive delivery tracking link

---

## PHASE 5: Analytics

### Requirement 14: LTV & CAC Reports

**User Story:** As an admin, I want to understand client economics.

#### Acceptance Criteria

1. THE CRM SHALL calculate LTV per client (total purchases - returns)
2. THE CRM SHALL calculate average LTV by acquisition source
3. THE CRM SHALL track CAC by marketing channel
4. THE Dashboard SHALL show LTV/CAC ratio
5. THE Dashboard SHALL show client cohort analysis

### Requirement 15: Product Analytics

**User Story:** As an admin, I want to understand product performance.

#### Acceptance Criteria

1. THE Dashboard SHALL show: views, wishlist adds, cart adds, purchases per product
2. THE Dashboard SHALL show: conversion funnel by category
3. THE Dashboard SHALL show: average time to sale by brand
4. THE Dashboard SHALL show: most viewed but not purchased items

---

## PHASE 6: Admin Panel

### Requirement 16: Админ-панель UI

**User Story:** As an admin, I want a beautiful admin panel matching the main site design.

#### Acceptance Criteria

1. THE Admin panel SHALL use same fonts (Koulen, DM Mono, Host Grotesk)
2. THE Admin panel SHALL use same color scheme (base-100 to base-700)
3. THE Admin panel SHALL use same button styles and animations
4. THE Admin panel SHALL be accessible at /admin without auth (temporary)
5. THE Admin panel SHALL have responsive design for tablet use
6. THE Admin panel SHALL have dark mode option

### Requirement 17: Админ-панель — Навигация

**User Story:** As an admin, I want easy navigation between sections.

#### Acceptance Criteria

1. Sections: Dashboard, Products, Orders, Clients, Analytics, Settings
2. THE Admin panel SHALL show notification badges for new orders
3. THE Admin panel SHALL have quick search across all entities
4. THE Admin panel SHALL remember last viewed section

---

## Database Schema (Supabase)

### Tables

1. `products` — id, name, brand, price, category, subcategory, sizes[], description, care_info, brand_story, condition, status, main_image_url, created_at, updated_at
2. `product_images` — id, product_id, image_url, is_main, sort_order, type (image/video)
3. `orders` — id, client_id, status, fitting_status, total, discount, final_total, courier_id, notes, created_at, updated_at
4. `order_items` — id, order_id, product_id, size, original_price, final_price
5. `order_status_history` — id, order_id, status, changed_by, notes, created_at
6. `clients` — id, name, phone, email, addresses[], tier, ltv, notes, created_at
7. `client_views` — id, client_id, product_id, viewed_at
8. `wishlists` — id, client_id, product_id, added_at
9. `waitlists` — id, client_id, product_id, priority, added_at
10. `invoices` — id, order_id, items[], discounts[], payment_link, status, created_at
11. `couriers` — id, name, phone, rating, notes
12. `messages` — id, client_id, order_id, source (telegram/whatsapp), content, direction, created_at
