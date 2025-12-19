# 

**ÖĞRENCİLER İÇİN YAPAY ZEKÂ DESTEKLİ KİŞİSEL FİNANS ASİSTANI**

**STTD – Software Technical & Test Documentation**

1. **GİRİŞ**

**1.1 Dokümanın Amacı**

Bu dokümanın amacı, üniversite öğrencileri için geliştirilen **yapay zekâ destekli kişisel finans asistanı** yazılımının teknik yapısını, sistem mimarisini, fonksiyonel ve fonksiyonel olmayan gereksinimlerini, veri tasarımını ve test süreçlerini ayrıntılı ve sistematik biçimde açıklamaktır.

Bu doküman, proje geliştirme sürecinde geliştirici ekip, akademik danışman ve değerlendiriciler için teknik bir referans kaynağı olarak hazırlanmıştır.

**1.2 Dokümanın Kapsamı**

Bu STTD dokümanı aşağıdaki başlıkları kapsamaktadır:

- Sistem genel tanımı
- Sistem mimarisi
- Fonksiyonel gereksinimler
- Fonksiyonel olmayan gereksinimler
- Veri tasarımı
- Yapay zekâ ve analiz modülü
- Test planı
- Riskler ve önlemler
1. **SİSTEM GENEL TANIMI**

**2.1 Problem Tanımı**

Üniversite öğrencilerinin büyük bir bölümü, sınırlı gelir kaynaklarına sahip olmalarına rağmen finansal yönetim konusunda yeterli farkındalığa sahip değildir. Özellikle:

- Gelir–gider dengesinin düzenli takip edilememesi
- Abonelik sistemlerinin yaygınlaşması
- Birden fazla banka hesabının eş zamanlı kullanımı
- Finansal okuryazarlık eksikliği

gibi nedenler, öğrencilerin bütçe kontrolünü zorlaştırmaktadır.

Mevcut kişisel finans uygulamaları genellikle genel kullanıcı kitlesini hedef almakta, **öğrencilerin yaşam tarzına ve gelir düzeyine uygun kişiselleştirilmiş çözümler sunmamaktadır**.

**2.2 Projenin Amacı**

Bu projenin amacı:

- Öğrencilerin gelir ve gider verilerini analiz etmek
- Harcama alışkanlıklarını ortaya koymak
- Kişiye özel finansal geri bildirimler sunmak
- Tasarruf ve birikim davranışlarını desteklemek
- Finansal farkındalık düzeyini artırmaktır

**2.3 Hedef Kitle**

- Üniversite öğrencileri
- KYK veya burs desteği alan öğrenciler
- Part-time çalışan gençler
- 18–30 yaş arası geliri sınırlı bireyler
1. **SİSTEM MİMARİSİ**

**3.1 Genel Mimari Yapı**

Sistem, **katmanlı mimari yaklaşımı** kullanılarak tasarlanmıştır. Bu yaklaşım, sistemin sürdürülebilirliğini ve ölçeklenebilirliğini artırmaktadır.

Ana katmanlar:

1. **Kullanıcı Arayüzü (Frontend)**
2. **İş Mantığı Katmanı (Backend)**
3. **Veritabanı Katmanı**
4. **Yapay Zekâ ve Analiz Modülü**

**3.2 Mimari Akış**

1. Kullanıcı gelir ve gider bilgilerini sisteme girer
2. Backend katmanı gelen verileri doğrular
3. Veriler veritabanına kaydedilir
4. Yapay zekâ modülü harcama verilerini analiz eder
5. Analiz sonuçları kullanıcı arayüzünde sunulur

**3.3 Kullanılan / Planlanan Teknolojiler**

- **Frontend:** React / Next.js
- **Backend:** Node.js veya Spring Boot
- **Veritabanı:** PostgreSQL
- **Yapay Zekâ:**
    - Harcama sınıflandırma algoritmaları
    - Zaman serisi analizi
- **Güvenlik:** JWT, HTTPS
1. **FONKSİYONEL GEREKSİNİMLER**

Bu bölüm, sistemin kullanıcıya sunduğu **tüm fonksiyonel özellikleri** kapsamaktadır.

**4.1 Gelir ve Gider Yönetimi**

**FR-01 – Gelir Ekleme**

Kullanıcı gelir bilgilerini tarih ve tutar bilgileriyle sisteme ekleyebilir.

**FR-02 – Gider Ekleme**

Kullanıcı gider bilgilerini açıklama, tarih ve tutar bilgileriyle sisteme ekleyebilir.

**4.2 Otomatik Harcama Kategorilendirme**

**FR-03 – Gider Kategorilendirme**

Sistem, gider açıklamalarını analiz ederek giderleri otomatik olarak kategorilere ayırır. Kullanıcı gerekirse kategoriyi manuel olarak değiştirebilir.

**4.3 Finansal Analiz ve Raporlama**

**FR-04 – Aylık ve Yıllık Analiz**

Sistem, aylık ve yıllık bazda gelir–gider analizleri üretir.

**FR-05 – Grafiksel Gösterim**

Harcama ve gelir verileri grafikler aracılığıyla görselleştirilir.

**4.4 Finansal Sağlık Skoru**

**FR-06 – Finansal Sağlık Skoru Hesaplama**

Sistem, kullanıcının harcama ve tasarruf alışkanlıklarını analiz ederek 1–100 arasında bir finansal sağlık skoru hesaplar.

**4.5 Ekstre Üzerinden Otomatik Analiz**

**FR-07 – Ekstre Yükleme**

Kullanıcı banka ekstresini sisteme yükleyebilir.

**FR-08 – Ekstre Analizi**

Sistem, yüklenen ekstreyi analiz ederek gelir ve giderleri otomatik olarak ayıklar.

**4.6 Yatırım ve Borsa Haber Analizi**

**FR-09 – Finansal Haber Analizi**

Sistem, finans ve borsa haberlerini analiz ederek kullanıcıya bilgilendirici özetler sunar. Bu özellik yatırım tavsiyesi içermez.

**4.7 Hedef Bazlı Tasarruf Planlaması**

**FR-10 – Tasarruf Hedefi Belirleme**

Kullanıcı finansal hedefler tanımlayabilir.

**FR-11 – Tasarruf Planı Oluşturma**

Sistem, belirlenen hedeflere ulaşmak için aylık tasarruf planları oluşturur.

**4.8 Tasarruf Etkisi Analizi**

**FR-12 – Tasarruf Senaryo Analizi**

Belirli giderlerin azaltılması durumunda oluşacak aylık ve yıllık tasarruf miktarı hesaplanır.

**4.9 Akıllı Finansal Uyarı Sistemi**

**FR-13 – Finansal Uyarılar**

Harcama limiti aşımı veya anormal harcama durumlarında kullanıcı uyarılır.

**4.10 AI Destekli Sohbet Asistanı**

**FR-14 – Finans Asistanı**

Kullanıcılar doğal dil kullanarak bütçe durumu ve finansal analizler hakkında sistemle etkileşime geçebilir.

1. **FONKSİYONEL OLMAYAN GEREKSİNİMLER**

**5.1 Performans**

- Sistem yanıt süresi 2 saniyenin altında olmalıdır.

**5.2 Güvenlik**

- Kullanıcı verileri şifreli olarak saklanmalıdır.
- Kimlik doğrulama ve yetkilendirme mekanizmaları uygulanmalıdır.

**5.3 Kullanılabilirlik**

- Arayüz sade, anlaşılır ve öğrenci dostu olmalıdır.

**5.4 Ölçeklenebilirlik**

- Sistem, yeni modüllerin eklenmesine uygun şekilde tasarlanmalıdır.
1. **VERİ TASARIMI**

**6.1 Temel Veri Varlıkları**

- User
- Income
- Expense
- Category
- Budget
- News
- Analysis
- Target
1. **YAPAY ZEKÂ VE ANALİZ MODÜLÜ**

**7.1 Harcama Analizi**

Geçmiş harcama verileri analiz edilerek kullanıcıya anlamlı geri bildirimler sunulur.

**7.2 Tahmin Mekanizması**

Zaman serisi analizleri kullanılarak geleceğe yönelik harcama tahminleri yapılır.

1. **TEST PLANI**

**8.1 Test Türleri**

- Birim Testleri
- Entegrasyon Testleri
- Sistem Testleri
- Kullanıcı Kabul Testleri

**8.2 Örnek Test Senaryosu**

**Test ID:** TC-01

**Test Adı:** Gider ekleme

**Beklenen Sonuç:** Gider verisi başarıyla kaydedilmelidir.

9.**RİSKLER VE ÖNLEMLER**

| **Risk** | **Önlem** |
| --- | --- |
| Yetersiz veri | Test ve örnek veri kullanımı |
| AI doğruluk oranı | Basit modellerle başlanması |
| Veri gizliliği | Güvenlik ve anonimlik politikaları |

**10.SONUÇ**

Bu doküman, öğrenciler için geliştirilen yapay zekâ destekli kişisel finans asistanının teknik yapısını, gereksinimlerini ve test süreçlerini ayrıntılı biçimde tanımlamaktadır. Sistem; öğrenci odaklı, ölçeklenebilir ve geliştirilebilir bir mimari sunmaktadır.

1. Görev Dağılımı

Mervegül Ateş- Frontend developer

İbrahim Yılmaz- DB developer

Arda Timuçin Acar - Backend developer

1. Zaman Yönetimi

20.00-21.00 :  Planlama ve Kurulum (Hedef: Kodlamaya başlamadan önce tüm belirsizlikleri gidermek.)

21:00 – 02:00 : MVP Çekirdek Geliştirme

02:00 – 08:00: Entegrasyon ve Fonksiyonellik

08:00 – 14:00:Görselleştirme

14:00 – 19:00: Test, Bug Fix ve Sunum

finance-assistant/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                      # landing / dashboard'a yönlendirme
│  ├─ globals.css
│  │
│  ├─ (dashboard)/
│  │  ├─ dashboard/
│  │  │  └─ page.tsx                # Dashboard UI
│  │  └─ analysis/
│  │     └─ page.tsx                # Analysis UI (grafikler)
│  │
│  ├─ expenses/
│  │  └─ page.tsx                   # Expenses UI
│  ├─ incomes/
│  │  └─ page.tsx                   # Incomes UI
│  ├─ budgets/
│  │  └─ page.tsx                   # Budget UI
│  ├─ targets/
│  │  └─ page.tsx                   # Target UI
│  ├─ news/
│  │  └─ page.tsx                   # News UI
│  │
│  ├─ api/
│  │  ├─ seed/
│  │  │  └─ route.ts                # demo user + sample data
│  │  ├─ expenses/
│  │  │  └─ route.ts                # GET/POST
│  │  ├─ incomes/
│  │  │  └─ route.ts                # GET/POST
│  │  ├─ categories/
│  │  │  └─ route.ts                # GET/POST (opsiyonel)
│  │  ├─ budgets/
│  │  │  └─ route.ts                # GET/POST/PUT (opsiyonel)
│  │  ├─ targets/
│  │  │  └─ route.ts                # GET/POST/PUT (opsiyonel)
│  │  ├─ news/
│  │  │  └─ route.ts                # GET (fetch + db)
│  │  ├─ analysis/
│  │  │  └─ route.ts                # GET (aggregations)
│  │  └─ dashboard/
│  │     └─ route.ts                # GET (summary)
│  │
│  └─ error.tsx / not-found.tsx     # opsiyonel
│
├─ components/
│  ├─ layout/
│  │  ├─ Navbar.tsx
│  │  ├─ Sidebar.tsx
│  │  └─ PageHeader.tsx
│  │
│  ├─ expenses/
│  │  ├─ ExpenseForm.tsx
│  │  └─ ExpenseList.tsx
│  ├─ incomes/
│  │  ├─ IncomeForm.tsx
│  │  └─ IncomeList.tsx
│  ├─ budgets/
│  │  └─ BudgetCard.tsx
│  ├─ targets/
│  │  └─ TargetCard.tsx
│  ├─ charts/
│  │  ├─ MonthlyBarChart.tsx
│  │  └─ CategoryPieChart.tsx
│  └─ ui/                           # shadcn gibi temel UI bileşenleri (opsiyonel)
│
├─ lib/
│  ├─ prisma.js                     # PrismaClient singleton
│  ├─ serialize.ts                  # Decimal -> string helpers
│  ├─ validators.ts                 # zod şemaları (opsiyonel ama önerilir)
│  └─ auth.ts                       # login eklersen (opsiyonel)
│
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
│
├─ scripts/
│  ├─ seed.ts                       # istersen CLI seed (opsiyonel)
│  └─ import-news.ts                # opsiyonel
│
├─ docker-compose.yml               # sadece Postgres
├─ .env.example                     # ekip için örnek env
├─ .env                             # local (GIT’e girmez)
├─ .gitignore
├─ package.json
├─ tsconfig.json
├─ next.config.ts
└─ [README.md](http://readme.md/)

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
}

model User {
id        String   @id @default(cuid())
email     String   @unique
name      String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

categories Category[]
incomes    Income[]
expenses   Expense[]
budgets    Budget[]
targets    Target[]
analyses   Analysis[]
news       News[]
}

model Category {
id        String       @id @default(cuid())
name      String
type      CategoryType
color     String? // UI için (#RRGGBB)
icon      String? // UI için (örn: "coffee")
createdAt DateTime     @default(now())
updatedAt DateTime     @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

incomes  Income[]
expenses Expense[]
budgets  Budget[] // ✅ Budget ilişkisi karşı taraf

@@unique([userId, name, type])
@@index([userId, type])
}

model Income {
id          String      @id @default(cuid())
amount      Decimal     @db.Decimal(12, 2)
date        DateTime
title       String?
note        String?
paymentType PaymentType @default(CASH)
createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

categoryId String?
category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

@@index([userId, date])
@@index([categoryId])
}

model Expense {
id          String      @id @default(cuid())
amount      Decimal     @db.Decimal(12, 2)
date        DateTime
title       String
note        String?
paymentType PaymentType @default(CARD)
isRecurring Boolean     @default(false)
createdAt   DateTime    @default(now())
updatedAt   DateTime    @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

categoryId String?
category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

@@index([userId, date])
@@index([categoryId])
}

model Budget {
id        String   @id @default(cuid())
month     Int
year      Int
limit     Decimal  @db.Decimal(12, 2)
spent     Decimal  @default(0) @db.Decimal(12, 2)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

// Kategori bazlı bütçe (opsiyonel)
categoryId String?
category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

@@unique([userId, month, year, categoryId])
@@index([userId, year, month])
}

model Target {
id            String       @id @default(cuid())
title         String
description   String?
targetType    TargetType   @default(SAVING)
targetAmount  Decimal      @db.Decimal(12, 2)
currentAmount Decimal      @default(0) @db.Decimal(12, 2)
startDate     DateTime?
dueDate       DateTime?
status        TargetStatus @default(ACTIVE)
createdAt     DateTime     @default(now())
updatedAt     DateTime     @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId, status])
@@index([dueDate])
}

model Analysis {
id           String     @id @default(cuid())
periodType   PeriodType
year         Int
month        Int?
totalIncome  Decimal    @default(0) @db.Decimal(12, 2)
totalExpense Decimal    @default(0) @db.Decimal(12, 2)
balance      Decimal    @default(0) @db.Decimal(12, 2)
healthScore  Int        @default(0) // 0-100
insights     Json?
createdAt    DateTime   @default(now())
updatedAt    DateTime   @updatedAt

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([userId, periodType, year, month])
@@index([userId, year])
}

model News {
id          String    @id @default(cuid())
title       String
source      String?
url         String?
publishedAt DateTime?
tags        String[]
summary     String?
sentiment   Sentiment @default(NEUTRAL)
createdAt   DateTime  @default(now())

userId String
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId, createdAt])
@@index([publishedAt])
}

enum CategoryType {
INCOME
EXPENSE
}

enum PaymentType {
CASH
CARD
TRANSFER
OTHER
}

enum TargetType {
SAVING
DEBT_PAYOFF
}

enum TargetStatus {
ACTIVE
PAUSED
COMPLETED
CANCELED
}

enum PeriodType {
MONTHLY
YEARLY
}

enum Sentiment {
POSITIVE
NEUTRAL
NEGATIVE
}

docker compose :