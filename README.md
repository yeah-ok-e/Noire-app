# NOIRE Command Hub

An integrated command centre PWA for tracking metrics, goals, and performance.

## Features

- **Home Dashboard**: Quick overview of cash on hand, sales, outbound touches, and non-negotiable metrics
- **Noire Metrics**: Detailed view of sales, revenue, outbound engagement, and workout tracking
- **Goals Tracking**: Monitor weekly goals for touches, sales, workouts, revenue, and cash targets
- **Legacy Metrics**: Historical data tracking including days elapsed, total workouts, rent payments, and cumulative revenue
- **PWA Support**: Works offline and can be installed as an app
- **State Persistence**: Automatically saves all metrics to localStorage
- **Legacy Import**: Migrates data from previous dashboard versions

## Getting Started

1. Open `index.html` in a web browser
2. The app will automatically import any existing data from previous NOIRE dashboards
3. Click the home card to edit daily metrics
4. Use the navigation bar to switch between views

## Architecture

- **index.html**: Main HTML structure with all sections
- **styles.css**: Dark theme styling with responsive design
- **app.js**: Core application logic, state management, and rendering functions
- **sw.js**: Service worker for offline support and caching
- **manifest.json**: PWA configuration for app installation

## State Structure

```javascript
{
  date: '2026-05-13',
  cashOnHand: 0,
  cashCollected: 0,
  touches: 0,
  replies: 0,
  unitsSold: 0,
  saleRevenue: 0,
  markedToday: '',
  nonNegs: {
    body: false,
    money: false,
    noire: false,
    cash: false,
    sleep: false
  },
  totals: {
    workouts: 0,
    totalSales: 0,
    totalRevenue: 0,
    rentMonthsPaid: 0
  },
  history: []
}
```

## Goals

The app tracks five key weekly goals:

1. **50 Outbound Touches** - Track customer outreach
2. **3 Units Sold** - Sales target for the week
3. **5 Workouts** - Fitness commitment
4. **$500 Revenue** - Revenue goal
5. **$1,048 Cash On Hand** - Financial target

## Offline Support

The Service Worker enables:
- Offline functionality
- Asset caching
- Automatic fallback to cached index.html

## Browser Support

- Chrome/Edge 51+
- Firefox 44+
- Safari 11.1+
- Mobile browsers with Service Worker support

## Customization

Edit the following constants in `app.js` to customize:
- `START_DATE`: Reference date for legacy calculations
- `TARGET_DATE`: Target date for legacy calculations
- `IMPORT_KEYS`: Previous dashboard keys to import from
- Goal values and labels in the `goals` array

## License

Private
