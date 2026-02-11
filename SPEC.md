# Highline Cars — Vehicle Inspection Report Platform

## Technical Specification

**Stack:** Next.js 14 (App Router) + Supabase (Auth, DB, Storage) + Tailwind CSS + Puppeteer PDF
**Deployment:** Vercel
**Market:** India (INR, Indian vehicle regulations)

---

## 1. Architecture Overview

### 1.1 Existing System
- Next.js 14 with App Router, TypeScript, Tailwind CSS
- Supabase PostgreSQL database with Row Level Security
- Supabase Auth (email/password)
- Supabase Storage for media (`inspection-media` bucket)
- Puppeteer Core + @sparticuz/chromium for serverless PDF generation
- shadcn-style UI components (Radix UI primitives)
- React Hook Form + Zod for form validation

### 1.2 Auth Model
- **Simple two-role system:** Admin and Inspector
- Admin manages company settings and inspector accounts
- Inspector creates, edits, and finalizes inspections
- No role hierarchy beyond admin vs inspector
- No seat limits or subscription-based licensing

---

## 2. Settings (Gear Icon Modal from Navigation)

Access via a gear icon in the top navigation bar. Opens as a full-screen modal/drawer. **Admin-only access.**

### 2.1 Company Settings
- Edit company name (text input)
- Upload/change company logo (image upload with preview)
- Logo is used in PDF headers and as a diagonal watermark on every PDF page

### 2.2 Inspector Management
- List of all inspectors with name and email
- **Add inspector:** Admin provides email and password directly — account is created immediately via Supabase Admin API, inspector can log in right away (no invitation email flow)
- **Edit inspector:** Update name
- **Remove inspector:** Deactivate account

### 2.3 Inspector Self-Service
- Inspectors can edit their own name from settings
- Dashboard should NOT have the inspector name edit option (remove existing `inspector-profile.tsx` from dashboard)

### 2.4 Checklist Template Management
- Ship with a default industry-standard template (current 87 items across 7 categories, refined after Cars24 research)
- Admin can clone the default template to create custom templates
- Admin can add, remove, and reorder checklist items and categories within custom templates
- **Template versioning:** When an admin updates a template, draft inspections using that template receive a notification prompting the inspector to update or keep the current version. Finalized inspections are never affected.

---

## 3. Vehicle Selection & Information

### 3.1 Brand / Model / Version Dropdowns
- Cascading dropdown: Brand → Model → Version
- **Data source:** Third-party vehicle database API (e.g., CarQuery, NHTSA, or similar)
- **Real-time API calls:** Fetch brands on page load, models on brand select, versions on model select
- Requires internet connection for dropdown population
- Search/filter within each dropdown for large lists

### 3.2 Vehicle Information Fields (Standard Set)
- VIN (Vehicle Identification Number)
- Registration number
- Kilometer reading (odometer)
- Number of previous owners
- Fuel type (Petrol / Diesel / CNG / Electric / Hybrid)
- Transmission type (Manual / Automatic / CVT / DCT)
- Year of manufacture
- Insurance type & expiry date
- Color
- Customer name & phone
- Inspection city

### 3.3 Vehicle Stock Image
- Automatically fetch a small, clean-background image of the selected vehicle based on brand/model/version
- **Fallback:** If no image is found, allow the inspector to manually upload a stock photo
- Image displayed in the Vehicle Legal Summary section and on the PDF cover page

---

## 4. Inspection Form

### 4.1 Checklist System
- 7 categories, 87+ items (expandable via templates)
- **Categories:** Exterior & Body, Tyres & Wheels, Interior & Electrical, Engine & Transmission, Steering / Suspension / Brakes, Underbody / Chassis, Test Drive
- Each item has:
  - **Status:** OK | MINOR | MAJOR | NA (inspector input)
  - **1-10 Score:** Auto-derived from status + cost severity (for PDF display). Not manually entered.
    - Derivation logic: OK = 9-10, MINOR = 5-7 (adjusted by cost severity), MAJOR = 1-4 (adjusted by cost severity), NA = excluded
  - **Work Done:** Dropdown of predefined options per item type
  - **Notes:** Free text
  - **Cost Severity:** 0-4 scale
  - **Media:** Up to 3 photos per item (inline thumbnails)
  - **Tread Depth:** For tyre items only

### 4.2 Auto-Save
- Draft inspections auto-save every 30 seconds to Supabase
- Existing behavior preserved

### 4.3 Report Editability
- Inspections are editable even after finalization
- **Audit trail:** All changes are logged with timestamps in `inspection_revisions` table — original version is always preserved
- Revision history viewable by admin

---

## 5. Media Upload & Processing

### 5.1 Image Processing Pipeline
On every image capture/selection, apply the following pipeline:
1. **Auto-orient** based on EXIF rotation data
2. **Strip EXIF metadata** for privacy (remove GPS, device info, etc.)
3. **Compress** to max 1600px width, 80% JPEG quality
4. **Watermark** with subtle timestamp + inspector name overlay

### 5.2 Upload UX
- **Queue and batch:** Images are queued locally after processing, uploaded in batch when the user saves or navigates to the next section
- Prevents form blocking during uploads
- Visual queue indicator showing pending uploads count

### 5.3 Upload Confirmation
- **Inline thumbnail:** Small thumbnail preview appears directly within the checklist item row, next to the status/notes fields
- Shows immediately after capture/selection (before upload completes)
- Delete/retake option on each thumbnail
- Up to 3 thumbnails visible per item

### 5.4 Engine Sound / Video
- Video recording allowed for the "engine-sound" checklist item
- **In PDF:** Upload recording to Supabase Storage, generate a QR code linking to the audio/video file, embed the QR code in the PDF
- Recheck and fix the existing engine video recording functionality

---

## 6. Visual Damage Map

### 6.1 Vehicle Silhouettes
- **Dynamic per body type:** Different silhouettes for sedan, SUV, hatchback, coupe, truck, etc.
- Silhouette auto-selected based on vehicle type derived from the brand/model/version selection
- SVG-based silhouettes for clean rendering at any scale

### 6.2 Zone System
- **Extended zones:** More granular than the 38 exterior checklist items
  - e.g., separate upper/lower door sections, individual panel segments
  - Each zone rolls up to the corresponding checklist item(s)
- **Pre-defined zones:** Inspector selects a zone from labeled areas on the silhouette, then selects damage type and severity
- **Single primary status per zone:** Each zone shows only the most severe damage type (scratch, dent, rust, crack, repaint, replaced, accident damage)
- No tap-to-place freeform markers

### 6.3 Damage Map in PDF
- Rendered as an SVG with color-coded zones (green = OK, yellow = MINOR, red = MAJOR)
- Legend showing damage type icons/colors
- Placed after Legal Summary in the report flow

---

## 7. Unified PDF Report

### 7.1 Report Merger
- **Merge Report A (Dealer/Bank) and Report B (Customer) into a single unified report**
- Remove the existing `/report-a/` and `/report-b/` route split
- Single report template serves all audiences
- Audience-specific visibility handled via share link preset profiles (see 7.7)

### 7.2 Branding & Theme
- **Fixed Highline Cars theme:** Colors, fonts, and layout hardcoded into the report template
- Professional color palette specific to Highline Cars
- Consistent typography matching the app (Space Grotesk / IBM Plex Mono)
- **Condition-coded accents:** Green/yellow/red for item statuses throughout

### 7.3 Company Logo Watermark
- Company logo rendered as a **diagonal watermark (~45 degrees)** across every PDF page
- **5-10% opacity** — subtle, does not interfere with readability
- Behind all page content

### 7.4 PDF Page Structure (Summary-First Order)

**Page 1: Cover Page (Full Summary Card)**
- Highline Cars logo + company name (properly aligned header blocks)
- Vehicle stock image (hero)
- Health score displayed as **letter grade (A+, A, B, C, D, F)** with a horizontal progress bar showing position on the scale
- Recommendation badge (YES / CAUTION / NO)
- Key stats: Kilometer reading, owner count, fuel type, year of manufacture, transmission
- Inspector name + inspection date
- QR code linking to the digital report (auto-generated share token)
- Inspection code

**Pages 2+: Content (Dense Continuous Flow)**
- **Vehicle Legal Summary:** Tabbed layout with vehicle image, registration details, insurance, hypothecation, fitness certificate, road tax, VIN embossing, flags (RC mismatch, scrapped, duplicate key)
- **Damage Map:** SVG silhouette with color-coded zones + legend
- **Checklist by Category:** Each category with:
  - Category header with aggregate score
  - Items listed with status indicator (color dot), 1-10 score, work done, notes
  - Up to 3 inline photo thumbnails per item (properly aligned in a row/grid)
  - Dense continuous pagination — categories CAN split across pages, but each split carries a repeated category header
- **Disclaimer** at the end: Standard disclaimer about inspection limitations and scope. Inspector name only in header, no digital signature.

### 7.5 PDF File Naming
- Format: `HIGHLINECARS_{BRAND}_{MODEL}_{DATE}_{SEQ}.pdf`
- Example: `HIGHLINECARS_HONDA_CITY_20260210_001.pdf`
- Date in YYYYMMDD format
- SEQ is a daily sequence number

### 7.6 PDF Generation Strategy
- **Pre-render on finalize:** When an inspection is finalized, the PDF is generated and cached in Supabase Storage
- Download is instant (served from storage, no Puppeteer call)
- If the inspection is amended after finalization, the PDF is regenerated and re-cached
- Eliminates the 60-second serverless timeout concern

### 7.7 Share Links & Preset Profiles
- Existing share token system (`/r/[token]`) is preserved
- **QR code on cover page:** Auto-generates a share token when PDF is rendered, embeds the share URL as a QR code
- **Three preset visibility profiles when creating a share link:**
  1. **Full Report** — All sections visible, nothing hidden
  2. **Customer View** — Hides financial data (repair costs, market value, cost severity, exposure %), hides inspector notes
  3. **Summary Only** — Shows only health score, recommendation, and key vehicle stats
- Admin selects preset when generating a share link
- `report_shares` table extended with a `profile` column (enum: full, customer, summary)

### 7.8 Print Behavior
- **Puppeteer PDF is the primary output** — optimized for this path
- **Browser print (Ctrl+P) is disabled** — force users to use the proper PDF download endpoint
- `@media print` CSS hides the "Download PDF" and "Back" buttons (defensive fallback)
- No print-specific optimization for browser printing

### 7.9 Health Score Display
- Internal: 0-100 numeric scale (existing algorithm preserved)
- **PDF Display:** Converted to letter grade with horizontal progress bar
  - A+ = 95-100, A = 90-94, B+ = 85-89, B = 80-84, C+ = 75-79, C = 70-74, D = 60-69, F = below 60
- Progress bar shows exact position on the 0-100 scale with color gradient (red → yellow → green)
- Recommendation badge (YES/CAUTION/NO) displayed alongside

### 7.10 Industry Standard Compliance
- **Research 20+ car inspection reports** (Cars24, Spinny, CarDekho, OLX Autos, Droom, Mahindra First Choice, Maruti True Value, Auto Inspect, AIS 140, DEKRA, TUV, etc.)
- Adapt best features: layout patterns, information hierarchy, color coding, scoring presentation, damage visualization, photo placement
- Ensure the PDF output matches or exceeds the quality of industry leaders

---

## 8. Offline Mode

### 8.1 Full Offline Support
- Complete offline capability for the inspection form
- **Photo capture:** Works offline, images stored locally
- **Form entry:** All fields editable offline with local storage/IndexedDB
- **Background sync:** When connectivity is restored, changes sync automatically to Supabase

### 8.2 Conflict Resolution
- **Last-write-wins:** Most recent save timestamp takes precedence
- Simple and predictable — if the same inspection is edited on two devices offline, the most recent save overwrites
- No manual merge resolution required

### 8.3 Offline Scope
- Vehicle brand/model/version dropdowns require internet (real-time API)
- Inspection form entry, photo capture, and checklist filling work offline
- PDF generation requires internet (server-side Puppeteer)
- Dashboard and settings require internet

---

## 9. Bug Fixes & Cleanup

### 9.1 PDF Button Leak
- "Download PDF" and "Back" buttons must NOT appear in the generated PDF
- Add proper CSS/DOM exclusion for Puppeteer rendering
- Add `@media print { display: none }` as defensive fallback

### 9.2 Dashboard Inspector Name
- Remove the inspector name edit option from the dashboard
- Move name editing to the Settings modal
- Fix the existing schema issue that prevented name editing

### 9.3 PDF Header Alignment
- Company name and logo properly aligned in block layout
- Logo on the left, company name on the right (or centered — consistent with Highline branding)
- Consistent header on every page

### 9.4 Engine Video/Sound
- Recheck and fix the engine video sound recording option
- Ensure video capture works on both iOS and Android browsers
- Verify playback in the report view

---

## 10. Database Schema Changes

### 10.1 New Tables

**company_settings**
- `id` (UUID, primary key)
- `company_name` (text)
- `logo_path` (text — Supabase Storage path)
- `created_at`, `updated_at` (timestamps)

**checklist_templates**
- `id` (UUID, primary key)
- `name` (text)
- `version` (integer, auto-increment per template)
- `is_default` (boolean)
- `categories` (jsonb — array of category definitions with items)
- `created_by` (UUID, FK to auth.users)
- `created_at`, `updated_at` (timestamps)

### 10.2 Modified Tables

**report_shares** — add column:
- `profile` (text — enum: 'full', 'customer', 'summary', default: 'full')

**inspections** — add column:
- `template_id` (UUID, FK to checklist_templates, nullable — null means legacy/default)
- `cached_pdf_path` (text — Supabase Storage path to pre-rendered PDF)
- `body_type` (text — sedan, SUV, hatchback, coupe, truck, etc. — for damage map silhouette)

**profiles** — ensure:
- `role` column properly enforces 'admin' | 'inspector' values

---

## 11. Implementation Priority

**All features are to be worked on in parallel — no sequential priority ordering.**

Major workstreams:
1. **PDF Redesign** — Unified report, Cars24 research, cover page, damage map, checklist layout, watermark, grade display
2. **Settings Modal** — Company settings, inspector CRUD, template management
3. **Damage Map Overhaul** — Body-type silhouettes, extended zones, pre-defined zone selection
4. **Vehicle API Integration** — Third-party API, cascading dropdowns, stock image fetch
5. **Media Pipeline** — Image processing (compress, EXIF strip, watermark, orient), queue/batch upload, inline thumbnails
6. **Offline Mode** — IndexedDB storage, background sync, last-write-wins conflict resolution
7. **Bug Fixes** — PDF button leak, dashboard name edit removal, header alignment, engine video

---

## 12. Non-Goals (Out of Scope)

- Subscription/billing system
- Role hierarchy beyond admin/inspector
- White-label / multi-tenant support
- Native mobile app (web PWA only)
- Real-time collaborative editing
- AI-powered damage detection from photos
- Integration with RTO verification APIs (stub exists but not in scope)
- SMS/WhatsApp report sharing
