# SnapLink — Development Journey & Architecture Walkthrough

This document outlines the evolutionary journey of building SnapLink, detailing what was initially planned, how the feature requirements shifted based on user experience reviews, and the advanced technical solutions implemented to deliver a secure, premium URL shortener.

---

## 🗺️ 1. Initial Concept & Baseline Setup
The project began as a standard MERN stack URL shortener, targeting the core mandatory requirements:
* **Core Goal**: A clean interface for users to sign up, log in, paste destination URLs, and generate unique, trackable short links.
* **Database Models**:
  * `User`: Credentials, email, hashed password.
  * `ShortUrl`: Mappings of destination URL, clicks, unique code, creation date, custom alias, and expiration time.
  * `Visit`: Timestamped logs representing redirections (storing User-Agent and parsed headers).
* **Initial Layout**:
  * A traditional dashboard page containing a left-aligned, collapsible options form for link configuration.
  * A links list grid requiring horizontal scroll-bars on smaller screens.
  * Separate links for analytics that required a page refresh and full navigation back-and-forth.

---

## 🔄 2. Design Evolution & Evolved Ideas
During continuous testing and user feedback loops, we identified major usability bottlenecks. We iteratively modified the UI and behavior to implement premium UX refinements:

### A. Dashboard Layout & Option Simplification
* **What We Changed**: The options form (Custom Alias, Expiry Date, Link Password) was initially hidden behind a collapsible toggle button. This was replaced by an **Always Open Options Grid** directly on the dashboard.
* **Why**: To reduce user clicks and keep optional fields visible.
* **Visual Improvement**: Re-ordered the statistics cards (Total Links, Total Redirects, Active Links) into a top horizontal row and expanded the shortened URLs list table to **full-width** to eliminate scrollbars and make analytics actions instantly reachable.

### B. Interactive Analytics Link Switcher
* **What We Changed**: Initially, to look at analytics for a different link, users had to click "Back to Dashboard", find the link, and click its analytics icon. We added a **Link Switcher Dropdown** directly in the Analytics page sub-header.
* **Why**: Users can now swap between various short URLs to compare tracking graphs without leaving the analytics dashboard page.

### C. Branded Glassmorphism Lock Screen
* **What We Changed**: Simple redirects were converted into an elegant gateway page when link passwords are set.
* **Why**: To offer a branded security checkpoint before redirection.
* **Implementation**: Programmed a custom CSS-styled HTML page served directly from the Express backend, complete with a floating glass card, animated gradient lock icon, error warnings, and the **SnapLink Logo** at the header.

---

## 🛡️ 3. Security & Technical Challenges Overcome

### A. The Browser Autofill Battle (UX Engineering)
* **The Problem**: During authenticated sessions, modern browsers (especially Google Chrome) detected form fields in the dashboard and lock screens as login inputs. The browser automatically filled the **Custom Alias** with the logged-in email and the **Link Password** with the user's account password.
* **The Fix**: Standard autocomplete overrides (`autocomplete="off"`) are actively ignored by browser credential managers. We developed a **three-layer protection system**:
  1. **Honeypot Fields**: Added hidden input fields in the DOM to trick and capture browser autofill signals.
  2. **`readOnly` Trigger**: Set inputs as `readOnly` by default to disable autofill hooks, toggling them to editable state `readOnly={false}` immediately upon user focus.
  3. **Auto-Clear Script**: Embedded a lightweight script on the redirect page to clear any autofilled values on startup.

### B. CSP Header Configuration
* **The Problem**: Using Helmet security headers automatically blocks redirects to external sites when submitting forms.
* **The Fix**: Adjusted the backend redirection routes to bypass content security constraints specifically for verified form redirects, enabling seamless outbound redirection once password hashes match.

---

## 📸 4. Visual Verification Results

The changes have been thoroughly validated with the browser subagent:

### Visual Verification Gallery

#### 1. Always Open Options Form
The URL creator form with Custom Alias, Expiry, and Password fields open by default in a premium options grid:
![Always Open Options Form](./docs/screenshots/dashboard_options_visible_1781326220961.png)

#### 2. Shortened Link with Lock Icon
A secure link successfully created with a lock `🔒` icon badge displayed in the links list table:
![Shortened Link with Lock Icon](./docs/screenshots/secglow3_created_1781326310545.png)

#### 3. Analytics Dropdown Link Switcher
The interactive link selector dropdown implemented in the sub-header:
![Analytics Dropdown Link Switcher](./docs/screenshots/analytics_page_redesign_1781322709651.png)

#### 4. Premium Lock Screen
Branded glassmorphic password page displayed when entering a secure link:
![Premium Lock Screen](./docs/screenshots/secglow3_password_page_1781326749944.png)

#### 5. Incorrect Password Error Glow
Entering an incorrect password displays an immediate warning state:
![Incorrect Password Error Glow](./docs/screenshots/wrong_password_error_1781326823763.png)

#### 6. Success Redirect to Destination
Correct credentials securely redirect the user to the destination:
![Success Redirect to Destination](./docs/screenshots/google_redirected_success_1781328223213.png)

---

### 🎬 Browser Session Video Recordings

For the complete validation flow of the hosted application, please refer to the browser session video recordings:

#### Full Feature Demo Recording (Latest V2)
![Full Feature Demonstration V2](./docs/screenshots/snaplink_demo_v2_1781341044333.webp)

#### Hosted App Walkthrough Recording (V1)
![Validation Session Recording](./docs/screenshots/hosted_app_demo_1781332914398.webp)
