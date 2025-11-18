# Planning Guide

SnapTallyMobile helps grocery shoppers track their cart total in real-time by photographing price tags and automatically tallying items as they shop. Now with shopping session management to organize trips by store and date.

**Experience Qualities**:
1. **Instant** - Camera opens immediately, scanning happens in seconds, feedback is instantaneous
2. **Trustworthy** - Clear visual confirmation of scanned items, accurate price tracking, transparent totals
3. **Effortless** - One-tap photo capture, automatic analysis, minimal interaction required, organized session history

**Complexity Level**: Light Application (multiple features with basic state)
  - Core functionality revolves around camera capture, API integration, shopping session management, and running total calculation with cloud-persisted state via API

## Essential Features

### Shopping Session Management
- **Functionality**: Start new shopping trips, view previous sessions, resume active sessions, finalize completed trips
- **Purpose**: Organize shopping by store and date, track spending patterns across multiple trips
- **Trigger**: App launch shows session list, tap "Start New Shopping Trip"
- **Progression**: View sessions → Tap start → Enter shop name & location → Session created → Navigate to shopping view
- **Success criteria**: Sessions persist across app usage, can resume active sessions, history displays correctly

### Photo Capture
- **Functionality**: Opens device camera to photograph price tags
- **Purpose**: Primary input method for adding items to active shopping session
- **Trigger**: Tap camera button on shopping screen (only available during active session)
- **Progression**: Tap camera → Camera opens → Capture photo → Image preview → Confirm → API analysis → Item added to session
- **Success criteria**: Photo captured clearly, sent to API, valid response received, item added to session via API

### Price Tag Analysis
- **Functionality**: Sends photo to Azure API endpoint for OCR/analysis
- **Purpose**: Extract item name, brand, price, and weight from price tag photo
- **Trigger**: User confirms captured photo
- **Progression**: Photo confirmed → Upload to API → Loading state → Parse response → Add item to session via API → Display item card
- **Success criteria**: API returns structured data, item added to session, displayed to user

### Running Tally
- **Functionality**: Maintains list of scanned items via API and displays cumulative total from session
- **Purpose**: Show real-time cart total to help shoppers stay within budget
- **Trigger**: Each successful item scan
- **Progression**: Item analyzed → Added to session → Session total updates → UI reflects new total
- **Success criteria**: Total accurate from API, updates smoothly, persists via session API

### Item Management
- **Functionality**: View session items, adjust quantities, remove items via API
- **Purpose**: Allow corrections and adjustments to shopping list during active session
- **Trigger**: Tap quantity controls or delete button on items
- **Progression**: Adjust quantity → API update → Session refreshes → Total recalculates
- **Success criteria**: Changes persist via API, total updates correctly, UI stays in sync

### Session Finalization
- **Functionality**: Complete and lock a shopping session
- **Purpose**: Mark trip as finished, preventing further edits, archiving the trip
- **Trigger**: Tap "Finish Shopping" button in active session
- **Progression**: Tap finish → Confirmation dialog → API finalizes session → Navigate to session list
- **Success criteria**: Session marked as inactive, can no longer add/edit items, appears in history

## Edge Case Handling
- **Network Failures** - Show retry option with clear error message for API calls
- **Invalid Price Tags** - Display validation error from API response
- **API Timeout** - 30-second timeout with retry mechanism, show loading progress
- **Camera Permissions** - Clear permission request flow, fallback to file upload if denied
- **Empty State** - Welcoming screen with instructions when no sessions exist or no items in session
- **Finalized Sessions** - Disable camera and editing controls, show read-only view
- **Session Load Failures** - Handle missing or deleted sessions gracefully

## Design Direction
The design should feel modern, fast, and utilitarian - like a professional tool that gets out of your way. Think Apple Pay meets a stopwatch: minimal chrome, large touch targets, instant feedback. Clean and confidence-inspiring rather than playful, with a focus on legibility in bright grocery store lighting.

## Color Selection
Complementary (opposite colors) - Fresh green for success/addition states paired with warm accents for totals and key actions, creating energy and forward momentum.

- **Primary Color**: Vibrant Green (oklch(0.65 0.19 150)) - Communicates freshness, affordability, and "add to cart" success
- **Secondary Colors**: Deep Charcoal (oklch(0.25 0.01 260)) for text/UI structure, Soft Gray (oklch(0.96 0.005 260)) for backgrounds
- **Accent Color**: Warm Coral (oklch(0.68 0.15 25)) for the running total and call-to-action elements, creates urgency and draws attention
- **Foreground/Background Pairings**: 
  - Background (Soft Gray #F5F5F6): Deep Charcoal text (#3A3A3D) - Ratio 11.2:1 ✓
  - Card (White #FFFFFF): Deep Charcoal text (#3A3A3D) - Ratio 13.5:1 ✓
  - Primary (Vibrant Green #4CAF50): White text (#FFFFFF) - Ratio 5.1:1 ✓
  - Accent (Warm Coral #E87D5C): White text (#FFFFFF) - Ratio 4.7:1 ✓
  - Muted (Light Gray #E8E8EA): Charcoal text (#3A3A3D) - Ratio 9.8:1 ✓

## Font Selection
Typography should be highly legible in varied lighting conditions with strong contrast between the large total and smaller item details - think receipt-like clarity with modern digital polish.

- **Typographic Hierarchy**: 
  - H1 (Total Price): Inter Bold/48px/tight tracking (-0.02em) - Dominates the screen
  - H2 (Item Name): Inter Semibold/18px/normal tracking - Clear hierarchy in list
  - H3 (Section Headers): Inter Medium/14px/wide tracking (0.05em) - Subtle organization
  - Body (Item Details): Inter Regular/15px/relaxed leading (1.6) - Brand, weight metadata
  - Caption (Timestamps): Inter Regular/13px/muted color - Scan time reference

## Animations
Animations should feel snappy and reassuring - confirmations that items were successfully captured and totals updated. Think cash register receipt printing: quick, mechanical, satisfying.

- **Purposeful Meaning**: Scale + fade for item additions (success), slide-out for deletions (removal), number counter for total updates (tangible value change), smooth transitions between session list and shopping view
- **Hierarchy of Movement**: Total price gets prominent display, item cards slide in with subtle motion, camera button appears smoothly, view transitions are clean and directional

## Component Selection
- **Components**: 
  - Card (shadcn) - Item list entries, session cards with shadow and hover states
  - Button (shadcn) - Camera capture (primary), finish shopping, navigation actions
  - Dialog/AlertDialog (shadcn) - Finalization confirmation, error states
  - Input (shadcn) - Session name and location, search/filter
  - Label (shadcn) - Form field labels in session creation
  - Badge (shadcn) - Active session indicator, quantity indicators
  - Separator (shadcn) - Dividing sections
  - Alert (shadcn) - Error messages for API failures
  - ScrollArea (shadcn) - Session list and item list with smooth scrolling
  
- **Customizations**: 
  - Camera preview component with capture overlay
  - Session card with store name, location, date, item count, and total
  - Shopping view with sticky header showing session info and total
  - Session start form with shop and location inputs
  
- **States**: 
  - Button: Loading states during API calls, disabled states when session finalized
  - Cards: Active session badge, hover effects on session cards
  - Forms: Validation states on session creation
  - Camera: Only shown during active sessions
  
- **Icon Selection**: 
  - Camera (@phosphor-icons) - Main capture action
  - ShoppingCart (@phosphor-icons) - Session management
  - MapPin (@phosphor-icons) - Location display
  - CalendarBlank (@phosphor-icons) - Date display
  - ArrowLeft (@phosphor-icons) - Navigation back
  - ArrowRight (@phosphor-icons) - Navigate into session
  - Plus (@phosphor-icons) - Start new session, increment quantity
  - Minus (@phosphor-icons) - Decrement quantity
  - Trash (@phosphor-icons) - Delete items
  - CheckCircle (@phosphor-icons) - Finalize session
  - X (@phosphor-icons) - Close, clear search
  - MagnifyingGlass (@phosphor-icons) - Search items
  
- **Spacing**: 
  - Container padding: px-4 py-6
  - Card gaps: gap-3 (12px)
  - Section spacing: space-y-6 (24px)
  - Button padding: context-appropriate sizes
  
- **Mobile**: 
  - Bottom-anchored camera button (thumb zone) - only in active sessions
  - Full-width session and item cards
  - Sticky header showing session info and total
  - Large 44px minimum touch targets
  - Clean navigation between session list and shopping view
  - Form inputs appropriately sized for mobile
