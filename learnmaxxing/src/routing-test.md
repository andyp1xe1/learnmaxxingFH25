# SPA Routing Configuration Test

## Current Routing Setup Summary

### Frontend Routes (React Router)

1. **Root path `/`**:

   - Uses `RootRedirect` component
   - Redirects to `/groups` if authenticated
   - Redirects to `/landing` if not authenticated

2. **Main app route `/groups`**:

   - Protected by `ProtectedRoute`
   - Shows `GroupsPage` component
   - **This is the main page for authenticated users**

3. **Public routes**:

   - `/login`: LogIn component
   - `/signup`: SignUp component
   - `/landing`: LandingPage component

4. **Other protected routes**:

   - `/modeselection`: ModeSelection component
   - `/exammode`: ExamMode component
   - `/learnmode`: LearnMode component
   - `/assestmentresults`: AssessmentResults component

5. **Catch-all route `*`**:
   - Uses `RootRedirect` component
   - Redirects based on authentication status

### Authentication Flow

1. **Unauthenticated users**:

   - Any route → redirects to `/landing`
   - Can access `/login` and `/signup`
   - After login → redirects to intended page or `/groups` by default

2. **Authenticated users**:
   - Any unrecognized route → redirects to `/groups`
   - Can access all protected routes
   - Root `/` → redirects to `/groups`

### Backend SPA Support

1. **Worker catch-all**: Returns 200 for non-API routes to let frontend handle routing
2. **`_redirects` file**: Configured for static hosting (Netlify/similar)

### Expected Behavior for "Main Page" = `/groups`

- ✅ Refresh on any route → appropriate redirect based on auth
- ✅ Direct navigation to `/groups` → shows groups page if authenticated
- ✅ Direct navigation to `/groups` → redirects to login if not authenticated
- ✅ After login → redirects to `/groups` by default
- ✅ Unknown routes → redirect to `/groups` if authenticated
- ✅ Root `/` → redirects to `/groups` if authenticated

## Test Cases

1. Visit `/` → should redirect to `/groups` (if auth) or `/landing` (if not auth)
2. Visit `/nonexistent` → should redirect to `/groups` (if auth) or `/landing` (if not auth)
3. Refresh on `/groups` → should stay on `/groups` (if auth) or redirect to login
4. Login → should redirect to `/groups` by default
5. Logout → should redirect to `/landing`
