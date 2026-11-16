# EcoCycle LK

**Smart Waste Management & Recycling Platform for Sri Lanka**

EcoCycle LK connects households, municipal councils and recycling companies on one platform. Residents can see when the garbage truck is coming, request pickups, report problems and earn reward points for recycling. Councils get live fleet tracking, optimized routes and an analytics dashboard.

> **Status:** In development. This README describes the planned system as defined in the project's Software Requirements Specification (SRS).

---

## Table of contents

- [The problem](#the-problem)
- [Key features](#key-features)
- [Unique feature: recycling reward points](#unique-feature-recycling-reward-points)
- [Who uses it](#who-uses-it)
- [System architecture](#system-architecture)
- [Tech stack](#tech-stack)
- [Planned project structure](#planned-project-structure)
- [Getting started](#getting-started)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## The problem

Waste collection in Sri Lankan urban councils often runs on fixed, poorly communicated schedules. Residents cannot see when a truck will arrive, missed collections and illegal dumping are reported by phone or not at all, and recyclable material is mixed with general waste because households have no incentive to separate it. Councils have little data to plan routes or measure performance.

## Key features

| Module | What it does |
|---|---|
| **Collection scheduling** | Ward-based schedules by waste type, reminders, and holiday changes |
| **Live truck tracking** | Garbage trucks on a live map with ETA to the user's address |
| **Collection requests** | Special or bulk pickup requests with full status tracking |
| **AI waste classification** | Take a photo of an item and get its waste type and disposal guidance |
| **Recycling reward points** | Earn points for verified drop-offs at registered collection centres |
| **Complaint management** | Geo-tagged complaints with photos, assignment and SLA tracking |
| **Route optimization** | Daily optimized collection routes for each truck and ward |
| **Municipal analytics** | Dashboards on tonnage, coverage, complaints and recycling rates |
| **Notifications** | Push, SMS and email alerts |
| **User & admin management** | Roles, wards, councils, reward rules, AI model versions and audit logs |

The interface will be available in **Sinhala, Tamil and English**.

## Unique feature: recycling reward points

Households earn points only when a **registered collection centre weighs and confirms** a drop-off of recyclable material, so points reflect real recycling rather than app activity.

```
Points = weight (kg) × material rate × campaign multiplier   (rounded down)
```

| Material | Points per kg (default) |
|---|---|
| PET bottles | 10 |
| Aluminium cans | 15 |
| Cardboard and paper | 5 |
| Glass | 3 |
| E-waste | 20 |

*Example:* 2.4 kg of PET bottles during a 1.5× campaign earns `floor(2.4 × 10 × 1.5) = 36` points.

How it works:

1. The household shows its QR code at a registered centre (or verifies with mobile number + OTP).
2. The centre operator records each material and its weight.
3. The system calculates the points and the operator confirms.
4. Points are credited and the household gets a digital receipt.
5. Points can be redeemed for vouchers or rewards from partners.

Rates are configurable by the administrator, and unusually large drop-offs are held for admin review to prevent fraud. Points have no cash value and cannot be transferred between users.

## Who uses it

| User | Main use |
|---|---|
| **Household user** | Schedules, truck tracking, pickup requests, AI classification, reward points, complaints |
| **Truck driver** | Assigned routes, navigation, marking stops done, reporting issues |
| **Council officer** | Schedules, fleet monitoring, requests and complaints, route optimization, analytics |
| **Collection centre operator** | Scanning household QR codes, recording drop-offs, issuing points |
| **Recycling company manager** | Centre profiles, material rates, drop-off reports |
| **System administrator** | Councils, users, roles, reward rules, AI models, audit logs |
| **Guest** | Public schedules, waste guide, centre map, anonymous complaints |

## System architecture

Four client apps share one back end:

```
 Household app ─┐
 Driver app ────┤                     ┌─ AI classification service (FastAPI)
 Centre web app ┼──► Spring Boot API ─┼─ Route optimization (OR-Tools)
 Council/Admin ─┘    REST + WebSocket └─ PostgreSQL + PostGIS
   web portal              │
                           └──► Maps · SMS gateway · FCM push · Email · S3/Cloudinary
```

## Tech stack

| Layer | Technology |
|---|---|
| Web front end | React (TypeScript) |
| Mobile apps | React Native (Household and Driver apps, Android and iOS) |
| Back end API | Java Spring Boot (REST, OpenAPI) |
| Security | Spring Security with JWT access and refresh tokens |
| Database | PostgreSQL with PostGIS |
| Real-time tracking | WebSocket with Spring STOMP |
| Maps | Google Maps Platform or Leaflet with OpenStreetMap |
| AI classification | Python FastAPI with TensorFlow or PyTorch (e.g. MobileNetV3) |
| Route optimization | Google OR-Tools |
| Charts | Recharts or Chart.js |
| Notifications | Firebase Cloud Messaging, SMS gateway, email |
| File storage | AWS S3 or Cloudinary |
| Deployment | Docker on AWS or Azure, with CI/CD |

## Planned project structure

```
ecocycle-lk/
├── backend/          # Spring Boot REST API and WebSocket server
├── web/              # React portal (council, admin, collection centre)
├── mobile/           # React Native app (household and driver)
├── ai-service/       # FastAPI waste classification service
├── docs/             # SRS, diagrams and other documentation
└── docker-compose.yml
```

## Getting started

> Setup steps will be added as each module is implemented. The planned prerequisites are:

- Java 17+ and Maven or Gradle
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 15+ with PostGIS
- Docker and Docker Compose

```bash
git clone https://github.com/malithdulsara/ecocycle-lk.git
cd ecocycle-lk
```

## Roadmap

- **Release 1 (MVP):** user management, collection scheduling, live truck tracking, collection requests, complaints, notifications, and the core reward-points flow
- **Release 2:** AI waste classification, route optimization, analytics dashboard, remaining reward features
- **Release 3:** weighing-scale integration, on-device AI, dynamic re-routing

**Future ideas:** IoT smart-bin sensors, council tax integration for points, carbon-credit reporting, and a public open-data portal.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

A license has not been chosen yet.

---

Made in Sri Lanka 🇱🇰 for cleaner cities.
