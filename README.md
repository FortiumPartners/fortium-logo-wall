# Logo Partner Wall Widget

Interactive partner logo wall that displays a 6×12 grid of tiles that flip between partner photos and company logos.

## Features

- **Interactive Flip Animation**: Hover over logos to see partner faces, hover over faces to see company logos
- **Auto-cycling**: Random tiles flip automatically every few seconds (like logo.dev)
- **Responsive Design**: Adapts to different screen sizes (12→8→6→3 columns)
- **Real API Integration**: Connects to Partner Connect API for live data
- **Logo.dev Integration**: Fetches company logos dynamically
- **HubSpot Compatible**: Can be embedded as a Custom HTML module

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual API credentials:
   ```env
   PARTNER_CONNECT_API_URL=https://your-api-domain.com/api
   PARTNER_CONNECT_API_KEY=your-api-key-here
   LOGODEV_TOKEN=pk_your_logodev_token_here
   PORT=3000
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```

4. **Open Browser**:
   Navigate to `http://localhost:3000`

## Data Sources

The widget supports three data sources:

1. **Sample Data** (default): Built-in demo data for testing
2. **JSON File**: Load from `partners.json` file
3. **Partner Connect API**: Live data from your API (requires authentication)

## API Integration

The widget fetches data from three endpoints:

- `/api/users` - Partner information and photos
- `/api/companies` - Company information and domains
- `/api/usercompanies` - Relationships between users and companies

The server handles authentication and proxies requests to your Partner Connect API.

## HubSpot Deployment

### Option 1: Embed Directly
Copy the HTML/CSS/JS from `index.html` into a HubSpot Custom HTML module. Replace the API calls with your data source.

### Option 2: iframe Embed
Host this widget externally and embed via iframe:
```html
<iframe src="https://your-domain.com" width="100%" height="600" frameborder="0"></iframe>
```

## Customization

### Grid Configuration
```javascript
const ROWS = 6;           // Number of rows
const COLS = 12;          // Number of columns
const FLIP_EVERY_MS = 2200; // Auto-flip interval
const FLIP_BATCH = 5;     // Number of tiles to flip at once
```

### Styling
All CSS is self-contained and uses CSS custom properties for easy theming.

### Logo Configuration
```javascript
const LOGO_SIZE = 96;     // Logo.dev image size
const IMG_BASE = "https://img.logo.dev"; // Logo.dev base URL
```

## Data Format

Expected partner data structure:
```json
[
  {
    "partnerId": "unique-id",
    "partnerName": "Partner Name",
    "photoUrl": "https://example.com/photo.jpg",
    "companies": [
      {
        "name": "Company Name",
        "domain": "company.com",
        "prominence": 100
      }
    ]
  }
]
```

## Performance Features

- **Intersection Observer**: Pauses auto-flip when not visible
- **Image Lazy Loading**: Only loads images when needed
- **Async Image Decoding**: Better performance on slower devices
- **Reduced Motion Support**: Respects user accessibility preferences

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid support required
- Fetch API support required