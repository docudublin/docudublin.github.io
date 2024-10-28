# How to Add a New App to the Landing Page

## Adding a New Card

1. Open `index.html`
2. Locate the `<main>` section
3. Add a new card using the following template:

```html
<a href="your-app.html" class="app-card your-app-name">
    <h2>Your App Name</h2>
    <p>Brief description of your application!</p>
</a>
```

## Adding Custom Styling

1. In the `<style>` section of `index.html`, add a new class for your app:

```css
.your-app-name {
    background-color: #YOUR_PASTEL_COLOR; /* Choose a pastel color */
    color: #2a2a2a;
}
```

## Pastel Color Suggestions

Here are some pastel colors you can use:
- Pastel Pink: `#FFB5BA`
- Pastel Blue: `#B5D8FF`
- Pastel Green: `#B5FFB5`
- Pastel Purple: `#E5B5FF`
- Pastel Yellow: `#FFF4B5`
- Pastel Orange: `#FFD5B5`

## Card Specifications

Each card follows these specifications:
- Width: 300px
- Aspect ratio: 1:1 (square)
- Border radius: 1rem
- Padding: 2rem
- Hover effect: Slight upward movement
- Text color: #2a2a2a (dark gray)

## Example

```html
<!-- Example of adding a new card -->
<a href="new-app.html" class="app-card new-app">
    <h2>New App</h2>
    <p>Description of the new application!</p>
</a>

<!-- Corresponding CSS -->
<style>
.new-app {
    background-color: #B5FFB5; /* Pastel Green */
    color: #2a2a2a;
}
</style>
```

## Important Notes

1. Maintain consistent spacing by keeping the same gap (2rem) between cards
2. Ensure your app's HTML file is in the same directory as index.html
3. Choose a unique pastel color to differentiate your app
4. Keep descriptions concise and clear
5. Test responsiveness on mobile devices after adding new cards
