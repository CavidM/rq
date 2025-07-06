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

### High-Level Concepts
- **staleTime**: How long data stays "fresh" (won't refetch)
- **gcTime**: How long unused data stays in memory

### ❌ Confusing Configuration
```typescript
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  staleTime: 1 * 60 * 1000,    // 1 minute fresh
  gcTime: 30 * 1000            // ⚠️ 30 seconds in memory - shorter than staleTime!
});
```

### ✅ Logical Configuration
```typescript
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  staleTime: 1 * 60 * 1000,    // 1 minute fresh
  gcTime: 5 * 60 * 1000        // 5 minutes in memory (longer than staleTime)
});

// Common patterns:
// Real-time data: staleTime: 0, gcTime: 30 * 1000
// Static data: staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000
// User data: staleTime: 1 * 60 * 1000, gcTime: 5 * 60 * 1000
```

**Rule:** gcTime should be longer than staleTime for optimal caching.

## 3. Object Destructuring Side Effects

### ❌ Bad - Destructuring Everything
```typescript
const ProductList = () => {
  // This creates new objects on every render!
  const { data, isLoading, error, refetch, ...rest } = useQuery({
    queryKey: ['products'],
    queryFn: api.products.getAll
  });

  // Problem: `rest` object changes on every render
  useEffect(() => {
    console.log('Effect runs on every render!');
  }, [rest]); // ⚠️ Infinite re-renders

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

**Why:** Destructuring creates new objects, causing unnecessary re-renders.

## 4. Default Network Mode vs Always Mode

### ✅ Default Network Mode (Recommended)
```typescript
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: api.products.getAll,
  // networkMode: 'online' (default)
  // refetchOnReconnect: true (default)
});

// Benefits:
// - Pauses queries when offline
// - Automatically retries when back online
// - Prevents failed network requests
// - Better UX with loading states
```

### Always Mode (Alternative Approach)
```typescript
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: api.products.getAll,
  networkMode: 'always',
  refetchOnReconnect: true   // ✅ Works with 'always'
});

// Characteristics:
// - Always attempts to fetch, even offline
// - Shows actual network failures
// - Useful for debugging network issues
// - Different UX approach
```

### When to Use Always Mode
```typescript
// Only for special cases like:
const { data } = useQuery({
  queryKey: ['cached-data'],
  queryFn: fetchFromLocalStorage, // Not network dependent
  networkMode: 'always'
});

// Or when you want to see network failures for debugging
const { data } = useQuery({
  queryKey: ['debug-network'],
  queryFn: api.getData,
  networkMode: 'always',  // See actual network requests fail
  refetchOnReconnect: false
});
```

**Default is Better:** Modern React Query handles network state smartly. Use `networkMode: 'always'` only for non-network queries or debugging.

## Quick Reference

| Concept | Default | Good Practice |
|---------|---------|---------------|
| **Query Keys** | `['data']` | `['data', 'specific-purpose']` |
| **staleTime** | `0` | `1 * 60 * 1000` (1 min) for user data |
| **gcTime** | `5 * 60 * 1000` | `10 * 60 * 1000` (10 min) for cached data |
| **networkMode** | `'online'` | Keep default unless debugging |
| **Destructuring** | `const {...all}` | `const {data, isLoading}` |

## Workshop Teaching Points

1. **Show the console logs** when mount order causes cache conflicts
2. **Demonstrate offline behavior** with default vs always mode
3. **Use React DevTools** to show unnecessary re-renders from destructuring
4. **Explain timing relationships** between staleTime and gcTime with diagrams
5. **Live code examples** showing query key conflicts and their fixes
