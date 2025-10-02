# 🌍 AI Supply Chain Risk Radar - Frontend

A stunning, real-time supply chain risk monitoring dashboard with AI-powered predictive analytics.

## ✨ Features

- 🗺️ **Interactive Global Risk Map** - Visualize supplier risks across the world with color-coded markers
- 📰 **Live News Feed** - Real-time updates on supply chain disruptions with risk categorization
- ⚡ **AI-Powered Recommendations** - Smart suggestions for risk mitigation and alternate routing
- 🌤️ **Weather Monitoring** - Track weather conditions affecting supply routes
- 📊 **Real-Time Statistics** - Monitor system health and operational metrics
- 🎨 **Beautiful UI/UX** - Modern, animated interface with smooth transitions

## 🚀 Tech Stack

- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **React Leaflet** - Interactive maps
- **Vite** - Lightning-fast build tool
- **CSS3** - Advanced animations and styling

## 📁 Project Structure

```
supply-chain-risk-radar-frontend/
├── public/
│   └── data/
│       ├── suppliers.json       # Supplier risk data
│       └── news_feed.json       # News feed data
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation with stats
│   │   ├── Sidebar.jsx         # Side navigation menu
│   │   ├── RiskMap.jsx         # Interactive world map
│   │   ├── RiskPanel.jsx       # Risk recommendations
│   │   └── Feed.jsx            # Live news feed
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   └── About.jsx           # About page
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd supply-chain-risk-radar-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## 🎨 Design Features

### Animations
- Smooth fade-in effects on page load
- Hover transitions on interactive elements
- Pulsing alerts for high-risk items
- Shimmer effects on cards
- Gradient animations in background

### Color Palette
- **Primary Background**: Dark blue gradients (#0f172a, #1e293b)
- **Accent Color**: Cyan (#06b6d4, #0ea5e9)
- **Risk Colors**:
  - High: Red (#ef4444)
  - Medium: Orange (#f59e0b)
  - Low: Green (#10b981)

### Components

#### Navbar
- Fixed top navigation
- Real-time statistics display
- System status indicators
- Glassmorphism effect

#### Sidebar
- Sticky side navigation
- Active route highlighting
- Smooth transitions
- System status widget

#### Risk Map
- Interactive Leaflet map
- Color-coded risk markers
- Detailed popups with supplier info
- Zoom and pan controls

#### Risk Panel
- Prioritized risk list
- AI-generated recommendations
- Risk level badges
- Urgent action alerts

#### Live Feed
- Real-time news updates
- Risk filtering (All/High)
- Timestamp indicators
- Auto-refresh notifications

## 📊 Data Structure

### suppliers.json
```json
{
  "name": "Supplier Name",
  "location": "City, Country",
  "lat": 12.345,
  "lng": 67.890,
  "risk": "HIGH|MEDIUM|LOW",
  "reason": "Risk explanation"
}
```

### news_feed.json
```json
{
  "title": "News Title",
  "summary": "Brief description",
  "source": "Source Name"
}
```

## 🎯 Customization

### Adding New Suppliers
Edit `public/data/suppliers.json` and add new supplier objects with coordinates.

### Adding News Items
Edit `public/data/news_feed.json` and add new news entries.

### Styling
All styles are in `src/index.css`. Modify CSS variables in `:root` for theme changes:
```css
:root {
  --primary: #0f172a;
  --accent: #06b6d4;
  /* ... more variables */
}
```

## 🌐 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1200px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔧 Troubleshooting

### Map not loading
Ensure Leaflet CSS is properly imported in RiskMap.jsx:
```javascript
import "leaflet/dist/leaflet.css";
```

### Data not showing
Check that JSON files are in `public/data/` directory and properly formatted.

### Build errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for the Supply Chain Risk Radar Hackathon

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet for mapping library
- React team for amazing framework
- Vite for blazing fast builds

---

**Ready to predict the future of your supply chain?** 🚀