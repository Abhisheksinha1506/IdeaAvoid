# IdeaAvoid - Over-Saturated Ideas to Avoid

A Vue.js website that helps entrepreneurs and developers identify business ideas that have been implemented countless times. The purpose is to **warn users to avoid these over-saturated concepts** to save time and resources. This site displays curated ideas from Reddit and other sources that have already been implemented in many forms, serving as a reference of what NOT to build.

## ⚠️ Important Note

**This website is NOT a source of business ideas to implement.** Instead, it serves as a **warning system** to help entrepreneurs and developers identify over-saturated business concepts that have already been implemented countless times. The purpose is to help you **avoid** wasting time and resources on ideas that are already heavily saturated in the market.

## Features

- ⚠️ Clear warning messaging about over-saturated ideas
- 🎨 Modern, clean UI design
- 🔍 Real-time search functionality
- 🎯 Advanced filtering by tags
- 📱 Fully responsive design
- ⚡ Built with Vue 3 and Vite
- 🎭 Component-based architecture

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
satuideas/
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── HeroSection.vue
│   │   ├── FiltersSection.vue
│   │   ├── LeadsSection.vue
│   │   ├── LeadCard.vue
│   │   └── Footer.vue
│   ├── data/
│   │   └── sampleData.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Customization

### Adding New Leads

Edit `src/data/sampleData.js` to add or modify leads. Each lead should have:
- `id`: Unique identifier
- `subreddit`: Subreddit name (e.g., 'r/Warthunder')
- `category`: Category (e.g., 'Gaming', 'Travel', 'Other')
- `date`: Date string (e.g., '2 months ago')
- `title`: Lead title
- `description`: Lead description
- `quotes`: Array of quote objects with `text` and optional `link`

### Styling

Modify `src/style.css` to customize colors, fonts, and layout. CSS variables are defined in `:root` for easy theming.

### Components

All components are in `src/components/`. Each component is self-contained and can be easily modified or extended.

## Technologies Used

- Vue 3 - Progressive JavaScript framework
- Vite - Next generation frontend tooling
- CSS3 - Modern styling with CSS variables

## License

MIT

