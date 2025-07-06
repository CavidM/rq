# React Query Best Practices & Common Pitfalls

## Understanding Device vs Server Data

### Device (Client) State
Data that lives on the user's device and is fully controlled by your app:

```typescript
// Device state examples
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('products');
const [formData, setFormData] = useState({ name: '', email: '' });
const [theme, setTheme] = useState('dark');

// Filters and search (often best in URL for sharing/bookmarking)
// This comes from react-router-dom
import { useSearchParams } from 'react-router-dom';
const [searchParams, setSearchParams] = useSearchParams();
const searchTerm = searchParams.get('search') || '';
const categoryFilter = searchParams.get('category') || 'all';
const sortOrder = searchParams.get('sort') || 'name-asc';
const currentPage = parseInt(searchParams.get('page') || '1');
const pageSize = parseInt(searchParams.get('size') || '10');

// Example URLs:
// /products?search=laptop&category=electronics&sort=price-asc&page=2
// /products?search=phone&category=all&sort=rating-desc

// UI interaction state (temporary, not shareable)
const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
const [sidebarOpen, setSidebarOpen] = useState(false);
const [expandedRows, setExpandedRows] = useState(new Set());
const [activeStep, setActiveStep] = useState(0);

// Local preferences (stored locally, not on server)
const [language, setLanguage] = useState('en');          // UI language
const [timezone, setTimezone] = useState('UTC');         // Display timezone
const [currency, setCurrency] = useState('USD');         // Price display currency
const [dateFormat, setDateFormat] = useState('MM/DD/YYYY'); // Date display format
const [notifications, setNotifications] = useState({ 
  email: true, 
  push: false,
  sound: true 
});

// These are often synced with localStorage:
// localStorage.setItem('language', 'en');
// localStorage.setItem('theme', 'dark');
```

**Characteristics:**
- ✅ **Synchronous** - Updated immediately
- ✅ **Predictable** - You control when it changes
- ✅ **Local** - Lives only in your app
- ✅ **Simple** - Use `useState`, `useReducer`, or URL params

**URL State vs Component State:**

| **URL State** (shareable) | **Component State** (temporary) |
|---------------------------|----------------------------------|
| Search terms | Modal open/closed |
| Filters | Sidebar collapsed |
| Pagination | Form validation errors |
| Sort order | Loading spinners |
| Tab selection | Dropdown expanded |

**Benefits of URL State:**
- 🔗 **Shareable** - Users can copy/paste filtered results
- 📖 **Bookmarkable** - Save specific views as bookmarks
- ⬅️ **Browser history** - Back/forward buttons work naturally
- 🔄 **Refresh-proof** - State survives page refreshes
- 📊 **Analytics** - Track popular searches/filters

### Server State
Data that lives on a remote server and can change without your app knowing:

```typescript
// Server state examples
const { data: products } = useQuery(['products'], fetchProducts);
const { data: user } = useQuery(['user', userId], () => fetchUser(userId));
const { data: orders } = useQuery(['orders'], fetchOrders);
const { data: notifications } = useQuery(['notifications'], fetchNotifications);
```

**Characteristics:**
- ⚠️ **Asynchronous** - Requires network requests
- ⚠️ **Unpredictable** - Can change anytime on the server
- ⚠️ **Shared** - Other users can modify it
- ⚠️ **Complex** - Needs caching, loading states, error handling

### Why React Query Exists

React Query solves the complexity of **server state**:

```typescript
// ❌ Without React Query (complex)
const [products, setProducts] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetchProducts()
    .then(data => {
      setProducts(data);
      setIsLoading(false);
    })
    .catch(err => {
      setError(err);
      setIsLoading(false);
    });
}, []);

// ✅ With React Query (simple)
const { data: products, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
});
```

**React Query handles:**
- Loading states
- Error handling
- Caching
- Background updates
- Stale data
- Deduplication

---

## 1. Different Query Keys Even with Same API

📖 **Reference:** [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)

### ❌ Wrong - Conflicting Cache Options
```typescript
// useProducts.ts
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: api.products.getAll,
  gcTime: 0  // Immediate cleanup
});

// usePopularCategories.ts  
const { data: categories } = useQuery({
  queryKey: ['products'],        // ⚠️ Same key, different needs!
  queryFn: api.products.getAll,
  select: (products) => getPopularCategories(products),
  gcTime: 5 * 60 * 1000  // 5 minutes - conflicts with above
});
```

### ✅ Correct - Specific Query Keys
```typescript
// useProducts.ts
const { data: products } = useQuery({
  queryKey: ['products'],    // Main products list
  queryFn: api.products.getAll,
  gcTime: 0
});

// usePopularCategories.ts  
const { data: products } = useQuery({
  queryKey: ['popular-categories'],  // Different purpose
  queryFn: api.products.getAll,
  select: (products) => getPopularCategories(products),
  gcTime: 5 * 60 * 1000
});
```

**Why:** Different cache behaviors need different keys, even with same API endpoint.

## 2. StaleTime vs GcTime - Simple Explanation

📖 **Reference:** [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) | [Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)

### What They Control

**staleTime** - Controls automatic refetching behavior
- Think: "How long should I trust this data?"
- While fresh: React Query won't refetch automatically (on window focus, remount, etc.)
- When stale: React Query will refetch when it gets a chance

**gcTime** - Controls memory cleanup (formerly `cacheTime` in v4)
- Think: "How long should I keep this data in memory?"
- While in memory: Instant loading when you revisit the same data
- After cleanup: Need to fetch from scratch again

### Step-by-Step Example: User Profile Data

Let's say you have user profile data with:
- **staleTime: 2 minutes** → "Trust this data for 2 minutes"
- **gcTime: 10 minutes** → "Keep it in memory for 10 minutes"

**Here's what happens:**

1. **0:00** - User visits profile page
   - React Query fetches user data
   - Data is **fresh** and stored in memory

2. **0:30** - User navigates away and comes back
   - Data is still **fresh** (under 2 minutes)
   - No refetch happens, loads instantly from memory

3. **2:30** - User visits profile page again
   - Data is now **stale** (over 2 minutes)
   - Shows cached data immediately, then refetches in background

4. **10:30** - User visits profile page again
   - Data was **garbage collected** (over 10 minutes)
   - Shows loading spinner, fetches from scratch

### Key Rule
Make `gcTime` longer than `staleTime` - otherwise you'll lose cached data before it even becomes stale!

## 3. Rest Destructuring Breaks Field Tracking

📖 **Reference:** [Render Optimizations](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations) | [ESLint Plugin](https://tanstack.com/query/latest/docs/eslint/no-rest-destructuring)

### ❌ Bad - Rest Destructuring All Fields
```typescript
const ProductList = () => {
  // This subscribes to ALL fields, breaking React Query's optimization!
  const { data, isLoading, error, refetch, ...rest } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  // Problem: Component re-renders when ANY field changes
  useEffect(() => {
    console.log('Effect runs on every render!');
  }, [rest]); // ⚠️ Triggers re-renders on any query field change — even if you don't use those fields

  return <div>{/* ... */}</div>;
};
```

### ✅ Good - Destructure Only What You Need
```typescript
const ProductList = () => {
  // Only destructure what you actually use
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  // If you need the query object, use it directly
  const query = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  useEffect(() => {
    if (someCondition) {
      query.refetch(); // Use specific methods when needed
    }
  }, [someCondition]); // ✅ Stable dependency

  return <div>{/* ... */}</div>;
};
```

**Why:** Rest destructuring disables React Query's [tracked queries optimization](https://tanstack.com/query/v5/docs/framework/react/guides/render-optimizations#tracked-properties), causing unnecessary re-renders when any field changes.

**ESLint Rule:** Use [`@tanstack/query/no-rest-destructuring`](https://tanstack.com/query/v5/docs/eslint/no-rest-destructuring) to catch this automatically.

## 4. Understanding Network Modes

📖 **Reference:** [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) | [Offline React Query](https://tkdodo.eu/blog/offline-react-query)

React Query has three network modes that control how queries behave when offline:

### `networkMode: 'online'` (Default)
- Queries pause when offline
- Resume when back online
- Best for API calls

### `networkMode: 'always'`
- Queries run regardless of network status
- Best for local operations (AsyncStorage, computations)
- Set `retry: false` to avoid unnecessary retries

### `networkMode: 'offlineFirst'`
- Tries once, then pauses if fails while offline
- Best for PWAs with service workers or HTTP caching

### ✅ Good - Default Mode for API Calls
```typescript
const ProductList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
    // networkMode: 'online' is the default
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* products */}</div>;
};
```

### ✅ Good - Always Mode for Local Operations
```typescript
// React Native AsyncStorage (local storage)
const { data } = useQuery({
  queryKey: ['user-settings'],
  queryFn: () => AsyncStorage.getItem('settings'),
  networkMode: 'always',     // This doesn't need network
  refetchOnReconnect: false, // Network reconnection is irrelevant
  retry: false               // Don't retry local operations
});
```

### ✅ Handling Offline States in UI
```typescript
const ProductList = () => {
  const { data, isLoading, error, fetchStatus } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  // Handle the paused state properly
  if (fetchStatus === 'paused') {
    return <div>📡 Offline - {data ? 'showing cached data' : 'no data available'}</div>;
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* products */}</div>;
};
```

**Note:** `fetchStatus` reflects whether the query is actively fetching (`fetching`, `paused`, or `idle`). `status` reflects the result (`loading`, `success`, `error`).

### ✅ Better - Global Offline Banner
```typescript
// hooks/useNetworkStatus.ts
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  return { isOnline };
};

// components/OfflineBanner.tsx
const OfflineBanner = () => {
  const { isOnline } = useNetworkStatus();
  
  if (isOnline) return null;
  return (
    <div style={{background: '#f59e0b', padding: '8px', textAlign: 'center'}}>
      📡 You're offline - showing cached data
    </div>
  );
};
```

**Solution:** Single global banner + clean components that focus on their data.

## 5. Understanding Status vs FetchStatus

📖 **Reference:** [useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)

React Query tracks two separate states that work together:

### `status` - What data do we have?
- `pending` - No data yet, never fetched successfully
- `success` - Has data (might be stale)
- `error` - Has an error (might also have stale data)

### `fetchStatus` - What's happening with the network request?
- `fetching` - Actively making a network request
- `paused` - Should be fetching but is paused (offline)
- `idle` - Not currently fetching

### Key Insight: They're Independent!
You can be in `success` status while `fetching` new data, or in `pending` status while `paused` offline.

### ✅ Common Pattern - What Most Apps Do
```typescript
const ProductList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.map(product => <div key={product.id}>{product.name}</div>)}</div>;
};
```

**Simple and works great for most use cases.**

## Quick Reference Table

| Concept | Default | Good Practice |
|---------|---------|---------------|
| **Query Keys** | `['data']` | `['data', 'specific-purpose']` |
| **staleTime** | `0` | `1 * 60 * 1000` (1 min) for user data |
| **gcTime** | `5 * 60 * 1000` | `10 * 60 * 1000` (10 min) for cached data |
| **networkMode** | `'online'` | Keep default for API calls |
| **Offline Handling** | No handling | Use `fetchStatus === 'paused'` |
| **Destructuring** | `const {...all}` | `const {data, isLoading}` |
