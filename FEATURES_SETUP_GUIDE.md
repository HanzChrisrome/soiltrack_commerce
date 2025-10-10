# Soiltrack Features Section - Image Setup Guide

## 📸 How to Add Your Feature Images

I've created placeholder illustrations for each feature. To use your actual images from the design:

### 1. **Prepare Your Images**

Save your feature images in the `src/assets/features/` folder with these names:

- `monitoring-chart.png` - Real-time monitoring analytics chart
- `irrigation-system.png` - Automated irrigation system illustration
- `fertilizer-suggestions.png` - Fertilizer suggestions visual
- `ai-robot.png` - AI-driven insights robot/bot
- `mobile-app-1.png` - First mobile app screenshot
- `mobile-app-2.png` - Second mobile app screenshot (center)
- `mobile-app-3.png` - Third mobile app screenshot

### 2. **Update the Component**

Replace the placeholder sections in `LandingPage.tsx`:

#### Real-Time Monitoring:

```tsx
// Replace this placeholder:
<div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-6 h-48 flex items-center justify-center">
  <div className="text-center">
    <div className="text-4xl font-bold text-green-700 mb-2">NPK</div>
    <div className="text-sm text-gray-600">Analytics Chart</div>
  </div>
</div>

// With your actual image:
<div className="rounded-xl mb-6 overflow-hidden">
  <img
    src="/src/assets/features/monitoring-chart.png"
    alt="Real-time monitoring chart"
    className="w-full h-48 object-contain"
  />
</div>
```

#### Automated Irrigation:

```tsx
// Replace the emoji placeholder with:
<div className="rounded-xl mb-6 overflow-hidden">
  <img
    src="/src/assets/features/irrigation-system.png"
    alt="Irrigation system"
    className="w-full h-48 object-contain"
  />
</div>
```

#### AI Driven Insights:

```tsx
// Replace the robot emoji with:
<div className="rounded-xl mb-6 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 p-4">
  <img
    src="/src/assets/features/ai-robot.png"
    alt="AI assistant"
    className="w-full h-full object-contain"
  />
</div>
```

#### Farmer Friendly Application (Mobile Screenshots):

```tsx
// Replace the three phone mockups with:
<div className="flex items-center justify-center gap-4">
  {/* Phone 1 */}
  <div className="relative">
    <img
      src="/src/assets/features/mobile-app-1.png"
      alt="SoilTrack App Screen 1"
      className="h-56 w-auto rounded-2xl shadow-xl"
    />
  </div>

  {/* Phone 2 - Center (larger) */}
  <div className="relative z-10 transform scale-110">
    <img
      src="/src/assets/features/mobile-app-2.png"
      alt="SoilTrack App Screen 2"
      className="h-64 w-auto rounded-2xl shadow-2xl"
    />
  </div>

  {/* Phone 3 */}
  <div className="relative">
    <img
      src="/src/assets/features/mobile-app-3.png"
      alt="SoilTrack App Screen 3"
      className="h-56 w-auto rounded-2xl shadow-xl"
    />
  </div>
</div>
```

## ✨ Features Implemented

### 1. **Animated Partnership Section**

- ✅ Infinite scrolling animation (left to right)
- ✅ Pauses on hover
- ✅ Grayscale effect that removes on hover
- ✅ Smooth 20-second loop

### 2. **Features Grid**

- ✅ Responsive 3-column layout (2 columns on tablet, 1 on mobile)
- ✅ Clean card design with hover effects
- ✅ Proper spacing and typography
- ✅ Feature icons/illustrations with descriptions
- ✅ Bullet points for key benefits

### 3. **Styling Details**

- Green accent colors matching your brand (`green-700`)
- Hover shadow effects for interactivity
- Rounded corners for modern look
- Gradient backgrounds for visual interest

## 🎨 Customization Tips

### Change Animation Speed:

In `index.css`, modify the animation duration:

```css
.animate-scroll {
  animation: scroll 30s linear infinite; /* Change 20s to 30s for slower */
}
```

### Adjust Card Colors:

Change the gradient backgrounds in each feature card:

```tsx
className = "bg-gradient-to-br from-blue-50 to-green-50";
```

### Modify Grid Layout:

Change the number of columns:

```tsx
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
// Change lg:grid-cols-3 to lg:grid-cols-4 for 4 columns
```

## 📱 Responsive Design

The features section is fully responsive:

- **Mobile**: 1 column, stacked cards
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 3 columns
- **Large screens**: Same 3 columns with max-width container

## 🔧 Next Steps

1. Create the `src/assets/features/` folder
2. Add your feature images
3. Update the image paths in the component
4. Adjust styling as needed
5. Test on different screen sizes

Need help with anything else? Let me know!
