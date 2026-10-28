# ☕ Coffee Cup — Integrated Coffee Ordering Application
> ระบบสั่งกาแฟล่วงหน้าแบบปรับแต่งได้ (Full-Stack Web Application)  
> พัฒนาตามข้อเสนอเชิงแนวคิด (Concept Paper) วิทยาลัยเทคนิคเชียงใหม่

---

## 📖 1. ภาพรวมโปรเจกต์ (Project Overview)
**Coffee Cup** คือแพลตฟอร์มสั่งกาแฟล่วงหน้าแบบครบวงจร ที่เปิดโอกาสให้ผู้บริโภคสามารถ:
- เลือกร้านกาแฟพันธมิตรในพื้นที่ (พร้อมคำนวณระยะทางและแสดงพิกัดบนแผนที่)
- ปรับแต่งรสชาติกาแฟได้อย่างอิสระ (เลือกระดับความเข้ม, ระดับความหวาน, ขนาดแก้ว, และท็อปปิ้ง)
- กำหนดเวลารับได้ทั้งแบบ **"รับทันที"** หรือ **"กำหนดเวลารับล่วงหน้า (Scheduled Pickup)"** เพื่อไม่ต้องยืนรอคิว
- ชำระเงินผ่านระบบจำลอง (PromptPay QR, บัตรเครดิต, กระเป๋าเงิน/เครดิตในแอป)
- ติดตามสถานะการชงแบบเรียลไทม์ (Live Order Tracking) ผ่าน **Socket.IO** และ Web Notifications API
- สำหรับฝั่งร้านค้า (Shop Owner Dashboard) มีระบบจัดการออเดอร์ จัดคิวเครื่องดื่ม จัดการเมนู และวิเคราะห์ยอดขายด้วยกราฟ Recharts

---

## 🛠️ 2. Tech Stack

### Frontend (Client)
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (ธีมสีอบอุ่นแนวกาแฟ: ครีม `#F5EBD7`, น้ำตาลหลัก `#C19A6B`, น้ำตาลเข้ม `#6F4E37`)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Real-time Client**: Socket.IO Client
- **Charts / Analytics**: Recharts
- **Audio Feedback**: HTML5 Web Audio API Synthesizer (มีเสียงกริ่งและเสียงแจ้งเตือนในตัว)

### Backend (Server)
- **Runtime**: Node.js + Express.js (REST API Architecture)
- **Database**: MongoDB (Mongoose ODM) พร้อมระบบ **In-Memory MongoDB Server Fallback อัตโนมัติ** ทำให้สามารถรันได้ทันทีโดยไม่ต้องติดตั้ง MongoDB ภายนอก
- **Authentication**: JWT (JSON Web Token) + bcryptjs
- **Real-time Engine**: Socket.IO (Room-based: `user_{userId}`, `shop_{shopId}`)
- **Payment Service**: Mock Payment Gateway Service Layer แยกเป็นโมดูลอิสระ

---

## 🌟 3. โครงสร้างโฟลเดอร์ (Project Structure)

```text
ICOA/
├── package.json               # Root scripts (รัน client + server พร้อมกัน)
├── .env.example               # ตัวอย่าง Environment Variables
├── README.md                  # คู่มือการติดตั้งและใช้งาน
├── server/                    # Backend API (Node.js + Express + Socket.IO)
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── config/
│       │   └── db.js          # จัดการเชื่อมต่อ MongoDB + In-Memory Fallback
│       ├── models/            # Mongoose Schemas (User, Shop, MenuItem, Order, Notification)
│       ├── middleware/        # JWT Auth & Error Handling
│       ├── services/
│       │   ├── paymentService.js # Mock Payment Gateway Layer
│       │   └── socketService.js  # Realtime Socket.IO Events
│       ├── controllers/       # Business Logic
│       ├── routes/            # REST API Endpoints
│       ├── seeds/
│       │   └── seedData.js    # ข้อมูลเริ่มต้น (ร้าน 3 ร้าน, 30 เมนู, ออเดอร์ตัวอย่าง)
│       └── index.js           # Server Entry Point
└── client/                    # Frontend Web App (React + Vite + Tailwind)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── index.css
        ├── main.jsx
        ├── App.jsx
        ├── context/           # AuthContext, CartContext, SocketContext
        ├── services/          # API fetch wrapper, notificationAudio
        ├── components/        # Navbar, BottomNav, PromptPayQR, MockMap, StatusBadge
        └── pages/             # Home, ShopList, ShopDetail, CustomizeDrink, Cart, Checkout, OrderTracking, OrderHistory, Login, Register, ShopDashboard
```

---

## 🚀 4. วิธีการติดตั้งและรันโปรเจกต์ (Step-by-step Setup)

### ขั้นตอนที่ 1: ตรวจสอบความพร้อมของ Node.js
ตรวจสอบว่าเครื่องของคุณมี Node.js (แนะนำ v18 ขึ้นไป):
```bash
node -v
npm -v
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies ทั้งหมด
สามารถรันคำสั่งเดียวที่โฟลเดอร์หลัก:
```bash
npm run install:all
```
*(หรือเข้าไปติดตั้งทีละโฟลเดอร์ด้วย `cd server && npm install` และ `cd client && npm install`)*

### ขั้นตอนที่ 3: ปลูกข้อมูลจำลองเริ่มต้น (Seed Data)
คำสั่งนี้จะสร้างร้านกาแฟ 3 ร้าน (เชียงใหม่), เมนูเครื่องดื่ม 30 เมนู, ออเดอร์ตัวอย่างย้อนหลังสำหรับแดชบอร์ด, และบัญชีผู้ใช้ทดสอบ:
```bash
npm run seed
```
> **หมายเหตุ**: ระบบมี In-Memory MongoDB ฝังมาให้ในตัว หากเครื่องของคุณไม่มี MongoDB daemon เปิดอยู่ ระบบจะเปิด In-Memory MongoDB ชั่วคราวให้โดยอัตโนมัติ ทำให้พร้อมรันได้ทันที 100%!

### ขั้นตอนที่ 4: รันโปรเจกต์ทั้ง Server และ Client พร้อมกัน
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173`

*(หรือรันแยกหน้าต่าง: `npm run server` และ `npm run client`)*

---

## ☁️ 5. วิธีการ Deploy ขึ้น Vercel (Vercel Deployment)

โปรเจกต์นี้ได้รับการคอนฟิกไฟล์ `vercel.json` และระบบ SPA Routing Rewrite ไว้เรียบร้อยแล้ว รองรับการ Deploy ได้ 2 รูปแบบ:

### รูปแบบที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ - ง่ายที่สุด)
1. เข้าไปที่ [Vercel Dashboard](https://vercel.com/new) แล้วกด **"Add New Project"**
2. เลือก Import repository `XpkungZaza/Coffier-App`
3. Vercel จะตรวจพบ `vercel.json` อัตโนมัติ:
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm install && npm run build` (หรือปล่อยตามที่ Vercel ตรวจพบ)
   - **Output Directory**: `client/dist`
4. กด **Deploy** ได้ทันที!
5. เมื่อ Deploy เสร็จสิ้น สามารถเข้าชมเว็บแอปพลิเคชันได้ทันที โดยระบบมี **Demo Fallback Mode** ทำให้ทดสอบเลือกร้าน, ปรับแต่งสูตรกาแฟ, ใส่ตะกร้า, ชำระเงิน PromptPay QR, และใช้งาน Dashboard เจ้าของร้านได้ครบทุกฟีเจอร์

### รูปแบบที่ 2: Deploy โฟลเดอร์ `client` โดยตรง
หากตั้งค่า **Root Directory** ใน Vercel Settings ให้ชี้ไปที่โฟลเดอร์ `client`:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- ตัวไฟล์ [client/vercel.json](file:///client/vercel.json) จะดูแลการ Rewrite หน้า SPA ป้องกัน Error 404 ให้โดยอัตโนมัติ

*(ทางเลือกเพิ่มเติม: หากต้องการเชื่อมต่อ Backend จริง สามารถนำโฟลเดอร์ `server/` ไปโฮสต์บน Render / Railway แล้วนำ URL มาใส่ใน Environment Variable `VITE_API_URL` บน Vercel ได้)*

---

## 🔑 5. บัญชีผู้ใช้ทดสอบ (Demo Accounts)

ระบบมีปุ่ม **"Quick Demo Login" (คลิกเดียวเข้าสู่ระบบทันที)** ที่หน้า Login หรือกรอกข้อมูลดังนี้:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิพิเศษ / ข้อมูลเริ่มต้น |
|---|---|---|---|
| **ลูกค้า (Customer)** | `customer@coffeecup.com` | `password123` | มีเครดิตในกระเป๋า ฿650 สำหรับทดลองสั่งกาแฟ |
| **เจ้าของร้าน (Shop Owner)** | `owner@coffeecup.com` | `password123` | จัดการร้าน Lanna Brew Coffee, คิวออเดอร์, แก้ไขเมนู และดูกราฟยอดขาย |

---

## 📋 6. รายการ API Endpoints หลัก

| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย |
|---|---|---|---|
| `POST` | `/api/auth/register` | สาธารณะ | สมัครสมาชิก (customer / shop_owner) |
| `POST` | `/api/auth/login` | สาธารณะ | เข้าสู่ระบบ และรับ JWT Token |
| `GET` | `/api/auth/me` | สมาชิก | ดึงข้อมูลผู้ใช้ปัจจุบันและยอดเครดิต |
| `POST` | `/api/auth/topup` | สมาชิก | เติมเงินเข้ากระเป๋าเครดิต (จำลอง) |
| `GET` | `/api/shops` | สาธารณะ | ดึงรายชื่อร้านกาแฟ (คำนวณระยะทางตามพิกัด) |
| `GET` | `/api/shops/:id` | สาธารณะ | ดึงข้อมูลร้านกาแฟตาม ID |
| `GET` | `/api/shops/:id/menu` | สาธารณะ | ดึงรายการเมนูของร้านตามหมวดหมู่ |
| `POST` | `/api/orders` | สมาชิก | สร้างคำสั่งซื้อใหม่และส่งแจ้งเตือนผ่าน Socket.IO |
| `GET` | `/api/orders/my` | สมาชิก | ดูประวัติคำสั่งซื้อของตนเอง |
| `GET` | `/api/orders/shop` | เจ้าของร้าน | ดูรายการคำสั่งซื้อและคิวทำเครื่องดื่มของร้าน |
| `PATCH` | `/api/orders/:id/status`| เจ้าของร้าน | เปลี่ยนสถานะออเดอร์ (pending → in_progress → ready → completed) |
| `POST` | `/api/payments/mock` | สมาชิก | ทำรายการชำระเงินจำลอง (PromptPay, Card, Wallet) |
| `GET` | `/api/reports/sales` | เจ้าของร้าน | ดึงรายงานยอดขาย สถิติรายวัน และเมนูขายดี |
| `POST` | `/api/menu` | เจ้าของร้าน | เพิ่มเมนูเครื่องดื่มใหม่ |
| `PATCH` | `/api/menu/:id/toggle` | เจ้าของร้าน | สลับสถานะเปิด/ปิดการจำหน่ายเมนู |

---

## ☕ 7. จุดเด่นตามข้อเสนอเชิงแนวคิด (Concept Paper Alignment)
1. **หน้าหลัก (Home)**: ทักทายผู้ใช้, เมนูแนะนำ, โปรโมชัน Morning Sale, และปุ่มเด่น "Customize Your Coffee"
2. **ประวัติรายการที่เคยสั่งซื้อ (Order History)**: เลื่อนดูรายการย้อนหลัง พร้อมปุ่ม **"สั่งซ้ำ" (Reorder)** ที่ดึงสูตรเดิมเข้าตะกร้าได้ในคลิกเดียว
3. **เลือกร้านกาแฟ (Select Coffee Shop)**: แสดงร้านค้าพันธมิตรในเชียงใหม่ (Lanna Brew, Mornings & Mint, Bean Theory) พร้อมระยะทางแบบเรียลไทม์ และแผนที่ Interactive
4. **เลือกประเภทกาแฟ (Select Coffee Type)**: แยกประเภทอย่างเป็นระบบ ทั้งเอสเพรสโซ่, ลาเต้, มอคค่า, อเมริกาโน่, คาปูชิโน่, Cold Brew และเมนูตามฤดูกาล
5. **ปรับแต่งเครื่องดื่ม (Customization)**:
   - ความเข้ม 3 ระดับ (อ่อน 1 ช็อต, ปานกลาง 2 ช็อต, เข้ม 3 ช็อต)
   - ความหวาน 4 ระดับ (0%, 25%, 50%, 100%) พร้อมระบุปริมาณน้ำตาล/ไซรัป
   - ขนาดแก้ว Tall, Grande, Venti
   - Add-on ท็อปปิ้ง (Caramel, Vanilla, Oat Milk, Coffee Jelly ฯลฯ) พร้อมคำนวณราคาแบบเรียลไทม์
6. **หน้าชำระเงิน (Payment)**: กำหนดเวลารับล่วงหน้า และชำระผ่าน PromptPay QR จำลอง, บัตรเครดิต, หรือตัดจากกระเป๋าเงิน Coffee Cup
7. **แดชบอร์ดร้านค้า (Shop Owner Dashboard)**: ออกแบบรองรับการใช้งานบนแท็บเล็ตและคอมพิวเตอร์ จัดคิวตามเวลารับ มีเสียงแจ้งเตือนออเดอร์ใหม่ และกราฟยอดขายครบถ้วน
