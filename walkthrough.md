# SnapLink — Visual Walkthrough & Demo

> Complete visual demonstration of the SnapLink URL Shortener application, showcasing all features end-to-end.

---

## 🎬 Full Feature Demo Recording

The recording below demonstrates the complete application workflow — from user registration, URL shortening with custom alias & password protection, analytics dashboard, QR code generation, to link redirection through the branded lock screen.

### Latest Full Feature Demo (V2)
![SnapLink Full Feature Demo V2](./docs/screenshots/snaplink_demo_v2_1781341044333.webp)

### Hosted App Walkthrough (V1)
![Hosted App Walkthrough Recording](./docs/screenshots/hosted_app_demo_1781332914398.webp)

---

## 📸 Application Screenshots

### 1. Dashboard — URL Shortener Form & Links Table
The main dashboard with the URL shortener form (Custom Alias, Expiry Date, Password fields always visible), stats summary row, and the full-width links table with action buttons.

![Dashboard](./docs/screenshots/dashboard_options_visible_1781326220961.png)

### 2. Shortened Link with Lock Icon
After creating a password-protected link, a purple 🔒 lock icon appears next to the short URL in the table, indicating it requires a password to access.

![Shortened Link with Lock Icon](./docs/screenshots/secglow3_created_1781326310545.png)

### 3. Analytics Page with Link Switcher
The per-link analytics page showing click trends (line chart), device breakdown (pie chart), browser stats (bar chart), and an interactive dropdown to switch between links.

![Analytics Page](./docs/screenshots/analytics_page_redesign_1781322709651.png)

### 4. Premium Password Lock Screen
When a visitor clicks a password-protected short link, they are shown this branded glassmorphic lock screen with an animated lock icon and password input field.

![Premium Lock Screen](./docs/screenshots/secglow3_password_page_1781326749944.png)

### 5. Incorrect Password Error State
Entering the wrong password triggers a red error glow animation with a warning message, preventing unauthorized access.

![Incorrect Password Error](./docs/screenshots/wrong_password_error_1781326823763.png)

### 6. Successful Redirect
After entering the correct password, the user is seamlessly redirected to the original destination URL, and the visit is recorded in analytics.

![Successful Redirect](./docs/screenshots/google_redirected_success_1781328223213.png)

---

## 🗄️ Database Entries (MongoDB Atlas)

Live MongoDB Atlas Data Explorer screenshots verifying the stored document schemas:

### Users Collection
![MongoDB Atlas Users Collection](./docs/screenshots/mongodb_users_collection.png)

### Short URLs Collection
![MongoDB Atlas Short URLs Collection](./docs/screenshots/mongodb_shorturls_collection.png)
