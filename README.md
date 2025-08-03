# 🌍 Testimonial Globe

An interactive 3D globe showcasing professional testimonials from colleagues and collaborators around the world. Built with Next.js, TypeScript, and globe.gl.

![Live Demo](https://testimonial-globe.vercel.app)

## ✨ Features

- **Interactive 3D Globe**: Smooth, draggable globe with accurate geographic positioning
- **Real Testimonials**: 17 authentic testimonials from professional network
- **Multi-Testimonial Navigation**: Elegant popup system for locations with multiple testimonials
- **Visual Distinction**: Larger, brighter markers indicate multiple testimonials at a location
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **TypeScript**: Fully typed for better development experience

## 🎯 Key Highlights

- **Chicago Hub**: 5 testimonials from Chicago-based colleagues with seamless navigation
- **Global Reach**: Testimonials from US (Chicago, New York, Colorado, Nashville, Indiana, San Francisco, Seattle, Los Angeles) and international locations (Amsterdam, Goa India, London UK, Oaxaca Mexico, France)
- **Professional Network**: Features testimonials from design leaders, developers, executives, and entrepreneurs

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎮 How to Use

1. **Rotate the Globe**: Click and drag to explore different regions
2. **View Testimonials**: Click on any marker to view testimonials
3. **Navigate Multiple Testimonials**: Use the arrow buttons (← →) when multiple testimonials exist at one location
4. **Toggle Theme**: Use the sun/moon button to switch between light and dark modes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **3D Globe**: globe.gl & COBE
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📁 Project Structure

```
├── app/                     # Next.js app directory
│   ├── globe/              # Main globe page
│   ├── simple-globe-demo/  # Alternative globe implementation
│   └── layout.tsx          # Root layout
├── components/ui/          # Reusable UI components
│   ├── GlobeTestimonials.tsx  # Main testimonial globe (COBE)
│   ├── SimpleGlobe.tsx        # Alternative globe (globe.gl)
│   └── globe.tsx              # Base globe component
├── docs/                   # Documentation
│   └── testimonials.md     # Source testimonials data
└── lib/                    # Utility functions
```

## 🌟 Testimonial Features

- **Authentic Content**: Real testimonials from professional collaborators
- **Geographic Accuracy**: Precise coordinate mapping for each location
- **Smart Clustering**: Multiple testimonials at same location handled elegantly
- **Accessible Navigation**: Keyboard-friendly with proper ARIA labels

## 🎨 Design Philosophy

- **Clean & Minimal**: Focus on content without visual clutter
- **Intuitive UX**: Clear visual cues for user interactions
- **Performance First**: Optimized loading and smooth animations
- **Responsive**: Beautiful experience across all device sizes

## 🔗 Live Demo

Visit the live application: [testimonial-globe.vercel.app](https://testimonial-globe.vercel.app)

## 📝 License

MIT License - feel free to use this project as inspiration for your own testimonial showcase!

---

Built with ❤️ by [Vikram Bhalla](https://github.com/vikram-twodesign)