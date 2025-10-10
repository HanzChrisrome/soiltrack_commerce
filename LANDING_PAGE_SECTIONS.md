# Landing Page - New Sections Documentation

## 📦 Complete Landing Page Structure

Your landing page now includes all the following sections in order:

1. ✅ Hero Section (with CTA buttons)
2. ✅ Partnership Carousel (infinite scrolling)
3. ✅ Features Section (6 feature cards)
4. ✅ **Product Carousel** (Soiltrack Shop)
5. ✅ **FAQ Section** (About Soiltrack)
6. ✅ **Contact/Inquiry Form**
7. ✅ **Footer**

---

## 🛒 Soiltrack Shop - Product Carousel

### Features:

- **3 Slides** with 3 products each (9 products total)
- **Navigation arrows** on left and right
- **Dot indicators** at the bottom showing current slide
- **Smooth transitions** between slides
- **"View all products" button** in header
- **Product cards** with:
  - Product image placeholder
  - Product name
  - Description
  - Price in Philippine Peso (₱)
  - "Add to Cart" button with hover effect

### Customization:

To add real product images, replace the placeholder divs:

```tsx
<div className="aspect-square bg-gray-200 flex items-center justify-center">
  <div className="text-4xl">🌾</div>
</div>
```

With actual images:

```tsx
<img
  src="/path/to/product-image.jpg"
  alt="Product Name"
  className="aspect-square object-cover"
/>
```

### Styling:

- Clean white cards with shadow
- Green accent color for CTA buttons
- Hover effects on cards and buttons
- Responsive grid (1 column mobile, 3 columns desktop)

---

## ❓ FAQ Section

### Features:

- **5 SoilTrack-specific questions** covering:
  - What is SoilTrack and how it works
  - Compatible crops
  - Installation process
  - Remote access capabilities
  - Support availability
- **Accordion-style** - click to expand/collapse
- **Plus/Minus icons** indicating open/closed state
- **First question open by default** for better UX
- **Smooth animations** on expand/collapse

### Questions Included:

1. What is SoilTrack and how does it work?
2. What crops can benefit from using SoilTrack?
3. How do I install the SoilTrack sensors in my field?
4. Can I access SoilTrack data when I'm away from my farm?
5. What kind of support is available for SoilTrack users?

### Styling:

- Light gray background cards
- Green accent for icons
- Clean typography
- Proper spacing and padding
- Hover effects

---

## 📧 Contact/Inquiry Section

### Layout:

**Two-column grid** (stacks on mobile):

#### Left Column - Contact Information:

- Section badge: "[ CONTACT US ]"
- Large heading: "Get in Touch"
- **Location card** with map pin icon:
  - Address: #263 Bunsuran III, Pandi, Bulacan
- **Office contact card** with phone icon:
  - Phone numbers: 0966-933-0521, 0956-234-3156
  - Email: soiltrack@gmail.com
  - Note: "[ Check Below For Exact Location ]"

#### Right Column - Contact Form:

- SoilTrack logo at top
- **3 form fields:**
  - Name input
  - Email input
  - Message textarea
- **Submit button** (green, full-width)

### Form Features:

- Input fields with gray background
- Green focus ring on active field
- Smooth transitions
- Proper spacing and padding
- Fully functional with state management

### Styling:

- White card with shadow for form
- Green icon badges (rounded squares)
- Clean, minimal design
- Professional typography
- Responsive layout

---

## 🦶 Footer

### Layout:

**4-column grid** (stacks on mobile):

#### Column 1 & 2 - Brand Information:

- SoilTrack logo (inverted for dark background)
- Company description
- **Social media icons:**
  - Facebook
  - Twitter/X
  - Instagram
- Hover effect: changes to green

#### Column 3 - Quick Links:

- About Us
- Features
- Shop
- FAQ
- Contact

#### Column 4 - Support:

- Help Center
- Installation Guide
- Terms of Service
- Privacy Policy

### Bottom Bar:

- Copyright notice: "© 2024 SoilTrack. All rights reserved."
- Tagline: "Made with 💚 for Filipino Farmers"

### Styling:

- Dark gray background (gray-900)
- Light gray text (gray-300)
- White headings
- Green hover effects
- Border separator at bottom
- Social icons with hover animation

---

## 🎨 Design Consistency

All new sections maintain:

- ✅ **Green accent color** (#15803d / green-700) matching brand
- ✅ **Consistent spacing** (py-20 for sections)
- ✅ **Same typography** (DM Sans font)
- ✅ **Similar card styles** (rounded-xl, subtle shadows)
- ✅ **Hover effects** on interactive elements
- ✅ **Responsive design** for all screen sizes
- ✅ **Smooth transitions** and animations
- ✅ **Professional, formal appearance**

---

## 📱 Responsive Behavior

### Mobile (< 768px):

- Single column layouts
- Stacked cards
- Full-width buttons
- Adjusted font sizes

### Tablet (768px - 1024px):

- 2-column grids where appropriate
- Optimized spacing
- Balanced layouts

### Desktop (> 1024px):

- Full multi-column layouts
- Maximum content width (max-w-7xl)
- Optimal spacing and padding

---

## 🔧 Interactive Features

### Product Carousel:

- **State management** with `currentSlide`
- **Click handlers** for navigation
- **Keyboard accessible** (can add arrow key support)
- **Auto-play** (can be added if needed)

### FAQ Accordion:

- **State management** with `openFaq`
- **Toggle function** for expand/collapse
- **Only one open at a time** (optional behavior)
- **Smooth height transitions**

### Contact Form:

- **State management** with `formData`
- **Controlled inputs** for all fields
- **Ready for form submission** (add handler as needed)
- **Validation ready** (can add validation logic)

---

## 🚀 Next Steps

### To Add Real Content:

1. **Product Images:**

   - Replace emoji placeholders with actual product photos
   - Use consistent aspect ratios
   - Optimize images for web

2. **Product Data:**

   - Connect to your product database
   - Display real product names and prices
   - Add product links

3. **Form Functionality:**

   - Add form submission handler
   - Connect to backend API
   - Add email notifications
   - Add form validation

4. **Social Media Links:**

   - Update footer social links with real URLs
   - Add proper icons (if needed)

5. **Footer Links:**
   - Connect all footer links to actual pages
   - Create missing pages (Terms, Privacy, etc.)

---

## 💡 Customization Tips

### Change Colors:

```tsx
// Replace green-700 with your preferred color
className="bg-green-700" → className="bg-blue-700"
```

### Adjust Carousel Speed:

```tsx
className = "transition-transform duration-500";
// Change 500 to 300 for faster, 800 for slower
```

### Change FAQ Behavior:

To allow multiple FAQs open at once, modify the toggle logic:

```tsx
setOpenFaq(openFaq === index ? null : index);
// Change to allow multiple:
setOpenFaq(
  openFaq.includes(index)
    ? openFaq.filter((i) => i !== index)
    : [...openFaq, index]
);
```

### Add Auto-play to Carousel:

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
  }, 5000); // Change every 5 seconds
  return () => clearInterval(interval);
}, []);
```

---

## ✨ Animation Details

All sections include:

- **Fade-in animations** (can be added with Framer Motion)
- **Hover effects** on cards and buttons
- **Smooth transitions** on all interactive elements
- **Scale effects** on hover (cards grow slightly)
- **Color transitions** on hover

Your landing page is now complete with all requested sections! 🎉
