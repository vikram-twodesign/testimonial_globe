# Embedding the Interactive Globe on Squarespace

This document explains how to embed the interactive globe with testimonials on your Squarespace website.

## Deployment Instructions

1. Deploy your Next.js application to a hosting service (like Vercel, Netlify, or any other platform that supports Next.js).
2. Make sure your application is publicly accessible at a domain (e.g., `https://your-globe-app.vercel.app`).

## Embedding on Squarespace

### Method 1: Using Code Block

1. Log in to your Squarespace account and go to the page editor.
2. Add a "Code" block to the page where you want to display the globe.
3. Paste the following HTML code into the code block:

```html
<div style="width: 100%; height: 600px; position: relative;">
  <iframe 
    src="https://your-globe-app.vercel.app/globe" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
    allowfullscreen>
  </iframe>
</div>
```

4. Replace `https://your-globe-app.vercel.app` with the actual URL of your deployed application.
5. Adjust the height (`600px`) as needed to fit your design.

### Method 2: Using the Embed Block

1. In your Squarespace editor, add an "Embed" block where you want to display the globe.
2. Paste the URL of your application's globe page (`https://your-globe-app.vercel.app/globe`).
3. Adjust the dimensions as needed in the block settings.

## Features

The globe component includes the following features:

1. **Interactive 3D Globe**: Users can click and drag to rotate the globe.
2. **Location Markers**: Markers placed at specific geographic coordinates.
3. **Testimonial Pop-ups**: Clicking a marker opens a testimonial from that location.
4. **Light/Dark Mode Toggle**: Button in the top-right corner to switch between light and dark themes.
5. **Space Background**: Starry background that changes with the theme.
6. **Responsive Design**: Adapts to different screen sizes.
7. **Smart Rotation Control**: 
   - Slow auto-rotation that doesn't make users dizzy
   - Rotation slows down when hovering near markers for easier selection
   - Rotation stops when viewing a testimonial

## Customization

To customize the testimonials:

1. Edit the `components/ui/GlobeTestimonials.tsx` file.
2. Update the `testimonials` array with your own testimonials.
3. For each testimonial, provide:
   - `name`: The person's name
   - `company`: Their company or organization
   - `location`: Their location (city, country)
   - `testimonial`: The testimonial text
   - `coordinates`: The geographic coordinates [latitude, longitude] for their location
   - `size`: The size of the marker (0.1 is a good default)

You can also customize the appearance of the globe by modifying the `LIGHT_MODE_CONFIG` and `DARK_MODE_CONFIG` objects in the same file.

4. Redeploy your application for the changes to take effect.

## Troubleshooting

- If the globe doesn't appear, check your browser console for errors and ensure the iframe source URL is correct.
- If the globe appears but doesn't interact properly, make sure you have allowed full screen and interactions in your iframe settings.
- For custom domain issues, ensure proper CORS settings are configured in your Next.js application.
- If the markers are hard to click, you can increase their size in the testimonials array or adjust the hover detection radius.

## Support

For additional help, please contact the developer who set up this application for you. 