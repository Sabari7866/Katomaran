# SnapLink — Project Development & Evolution Journal

This document provides hackathon evaluators with a detailed overview of the design lifecycle of SnapLink. It traces our initial baseline implementation, the key usability and security challenges we encountered, and how we refined the architecture to build a highly successful, production-ready product.

---

## 🗺 1. Initial Concept & Scope

Our initial goal was to build a clean URL shortener with basic analytics tracking:
* **Frontend**: React client with simple routing (Login, Signup, Dashboard).
* **Backend**: Express server with JWT token validation and REST endpoints to shorten and list links.
* **Database**: MongoDB storing users, shorturls, and basic redirect timestamps.
* **UI**: Standard input form with collapsible accordions to hide optional details (custom alias, expiry date, password protection) and standard table drawers for row data.

---

## 🔄 2. Architectural Pivot Points & Refinements

As we ran end-to-end user validations, we identified major friction points and revised our initial design choices. Here are the key evolutionary changes made:

### A. Form Simplification (Options Visible by Default)
* **Initial Idea**: Hide "Custom Alias", "Link Expiry", and "Link Password" inside a collapsible accordion drawer to save space.
* **Problem**: Users found it tedious to constantly click and expand the settings panels when creating multiple links. It hid core premium capabilities of the app.
* **Refined Design**: Rendered the options directly in an open setting grid by default. This makes the interface feel much more dashboard-centric, clean, and direct.

#### 📸 Options Grid Layout:
![Always Open Options Form](./docs/screenshots/dashboard_options_visible_1781326220961.png)

---

### B. Dashboard Table Layout Refactoring
* **Initial Idea**: Show minimal details in the shortened links table, and expand details (like expiry, created date) in a drawer that opens upon clicking the row.
* **Problem**: Expanding drawers caused the dashboard layout to shift aggressively, causing visual layout shifting (CLS) and hiding actions.
* **Refined Design**: Expanded the links table to occupy full-width screen real estate. The drawers were removed, showing destination URLs, creation timestamps, click metrics, and expiration dates cleanly in standard columns. We also added action indicators directly in the table row (like a lock icon `🔒` for password-secured links).

#### 📸 Dashboard Refinement:
![Shortened Link with Lock Icon](./docs/screenshots/secglow3_created_1781326310545.png)

---

### C. Analytics Navigation (Drop-Down Link Switcher)
* **Initial Idea**: Force the user to navigate back to the Dashboard page to select another link to inspect its analytics.
* **Problem**: Selecting a different link was slow and required multiple page navigation cycles.
* **Refined Design**: Added a dynamic drop-down link switcher directly inside the sub-header of the Analytics page. Users can now seamlessly switch metrics tracking for different links instantly.

#### 📸 Analytics Dropdown Switcher:
![Analytics Dropdown Link Switcher](./docs/screenshots/analytics_page_redesign_1781322709651.png)

---

### D. Eliminating Browser Autocomplete & Autofill Intrusion
* **Initial Idea**: Trust default HTML `autocomplete="off"` attributes on optional fields.
* **Problem**: Modern browsers (especially Google Chrome) aggressively ignore `autocomplete="off"` when a page contains a password field, incorrectly pre-filling the user's email into the "Custom Alias" input and their account password into the "Link Password" input.
* **Refined Design (3-Layer Autofill Trap)**:
  1. **Honeypots**: Added invisible, styled inputs (`fake_username`/`fake_password`) to catch the browser's credentials suggestions first.
  2. **ReadOnly Locking**: Set fields as `readOnly` by default to disable autofill hooks, and removed the `readOnly` state on user `focus`/`click` actions so they can type.
  3. **Backend Script Clearing**: Embedded a quick javascript cleaner script on the redirect Lock Screen to purge any values that standard autocomplete managers pre-filled upon page load.

#### 📸 Lock Screen Redirection Gate:
![Premium Lock Screen](./docs/screenshots/secglow3_password_page_1781326749944.png)

---

### E. Redirect and Security Header Conflicts (Helmet.js & CSP)
* **Initial Idea**: Use strong, default Helmet security headers.
* **Problem**: The Content Security Policy (CSP) headers blocked redirect behaviors for third-party websites when a user verified a password.
* **Refined Design**: Structured specific CSP properties to permit redirections and loaded custom styles directly for the redirection page.

#### 📸 Invalid Password Shake Error Glow:
![Incorrect Password Error Glow](./docs/screenshots/wrong_password_error_1781326823763.png)

#### 📸 Success Redirection:
![Success Redirect to Destination](./docs/screenshots/google_redirected_success_1781328223213.png)

---

## 🏆 3. Verification Details & Live Demonstrations

We ran comprehensive tests on the live production servers to verify redirection response times, secure hashing, and click logging:

* **Production Demo Video (Latest Version)**:  
  Detailed flow showing registration, login, creation, unlock mechanics, and click analytics tracking:  
  ![SnapLink Demo Recording V2](./docs/screenshots/snaplink_demo_v2_1781341044333.webp)

* **Original Walkthrough Video**:  
  Hosted app verification tracking:  
  ![Validation Session Recording](./docs/screenshots/hosted_app_demo_1781332914398.webp)
