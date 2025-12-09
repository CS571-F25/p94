# Testing Multi-User Pin Sharing

## Current Behavior
The app uses localStorage which is **browser-specific**, meaning:
- ✅ Users on the SAME browser can see each other's pins
- ❌ Users on DIFFERENT browsers/devices cannot see each other's pins

## How to Test on Same Browser

1. **Create Pin as User A:**
   - Login as User A (e.g., ava@example.com)
   - Go to Map tab
   - Drop a pin somewhere
   - Add details and save

2. **Logout and Login as User B:**
   - Click Logout
   - Login as User B (e.g., dot@example.com)
   - Go to Map tab
   - You should see User A's pin!

3. **Verify Permissions:**
   - Click on User A's pin
   - You should NOT see a Delete button (only owner can delete)
   - You CAN add comments
   - User A's name should be clickable

## To Share Across Different Browsers/Devices
You would need:
- Backend server (Node.js/Express, Django, etc.)
- Database (MongoDB, PostgreSQL, etc.)
- API endpoints for CRUD operations
- Replace localStorage calls with API calls
