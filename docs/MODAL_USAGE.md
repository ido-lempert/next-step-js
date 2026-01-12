# Modal Component Usage Guide

## Overview

The Modal component provides a non-contextual training experience for displaying static training content in a centered modal dialog. Unlike walkthroughs that target specific elements on a page, modals are self-contained popups perfect for product tours, welcome screens, or feature announcements.

## Basic Usage

```typescript
import { startModal, ModalComponent } from '@next-step/sdk';

// Define your training script
const script = {
  id: 'welcome-tour',
  productId: 'my-app',
  name: 'Welcome Tour',
  type: 'modal',
  status: 'published',
  steps: [
    {
      id: 'step-1',
      scriptId: 'welcome-tour',
      orderIndex: 0,
      title: 'Welcome to Our App!',
      description: 'We\'re excited to show you around.',
      imageUrl: 'https://example.com/images/welcome.png'
    },
    {
      id: 'step-2',
      scriptId: 'welcome-tour',
      orderIndex: 1,
      title: 'Key Features',
      description: 'Here are some features you\'ll love...',
      imageUrl: 'https://example.com/images/features.png'
    },
    {
      id: 'step-3',
      scriptId: 'welcome-tour',
      orderIndex: 2,
      title: 'Get Started',
      description: 'You\'re all set! Click Done to begin.',
    }
  ]
};

// Start the modal
await startModal(script);
```

## Configuration Options

```typescript
import { createModal } from '@next-step/sdk';

const modal = createModal({
  // Animation speed (default: 300ms)
  animationDuration: 400,
  
  // Show/hide "Don't show again" checkbox (default: true)
  showDontShowAgain: true,
  
  // Days until dismissal expires (optional)
  dismissalExpiryDays: 30,
  
  // Delay before showing modal in ms (default: 0)
  displayDelay: 2000,
  
  // Callback when step changes
  onStepChange: (step, index) => {
    console.log(`Viewing step ${index + 1}:`, step.title);
  },
  
  // Callback when modal is completed
  onComplete: () => {
    console.log('User completed the tour!');
  },
  
  // Callback when modal is skipped/closed
  onSkip: () => {
    console.log('User skipped the tour');
  },
  
  // Callback when user checks "Don't show again"
  onDismiss: () => {
    console.log('User dismissed the tour permanently');
  },
  
  // Error handler
  onError: (error) => {
    console.error('Modal error:', error);
  }
});

// Start the modal with configuration
await modal.start(script);
```

## Features

### 1. Shadow DOM Isolation
Modal uses Shadow DOM to prevent CSS conflicts with your application:
- All styles are scoped within the modal
- No interference with host page styles
- Clean, predictable rendering

### 2. Responsive Design
- Desktop: Centered modal (max-width: 600px)
- Mobile: Full-screen modal for better readability
- Flexible layout adapts to content

### 3. Keyboard Navigation
- **ESC**: Close modal
- **Arrow Right / Enter**: Next step
- **Arrow Left**: Previous step
- **Tab**: Focus trap within modal

### 4. Accessibility
- ARIA `role="dialog"` and `aria-modal="true"`
- Focus trap keeps keyboard navigation within modal
- Screen reader support
- High contrast support

### 5. Image Support
Steps can include optional images:
```typescript
{
  title: 'Feature Screenshot',
  description: 'This is what it looks like...',
  imageUrl: 'https://example.com/screenshot.png'
}
```
- Images are lazy-loaded
- Responsive sizing (max-height: 400px)
- Graceful fallback if image fails to load

### 6. "Don't Show Again" Feature
Users can permanently dismiss a modal:
```typescript
// Check if user has dismissed
import { isDismissed } from '@next-step/sdk';

if (isDismissed('welcome-tour')) {
  console.log('User has already seen this');
} else {
  await startModal(script);
}

// Manually clear dismissal (e.g., after major update)
import { clearDismissal } from '@next-step/sdk';
clearDismissal('welcome-tour');

// Manually mark as dismissed
import { markAsDismissed } from '@next-step/sdk';
markAsDismissed('welcome-tour', 30); // Expires in 30 days
```

### 7. Analytics Tracking
All interactions are automatically tracked to localStorage:
```typescript
// Retrieve analytics
const events = JSON.parse(
  localStorage.getItem('nextstep_analytics') || '[]'
);

// Event types:
// - step_view: User viewed a step
// - navigation: User navigated (next/back/skip)
// - complete: User completed the tour
// - dismiss: User checked "Don't show again"
```

## Advanced Usage

### Conditional Display
```typescript
// Show modal only for new users
const isNewUser = !localStorage.getItem('user_onboarded');
if (isNewUser) {
  await startModal(newUserScript);
  localStorage.setItem('user_onboarded', 'true');
}

// Show modal after delay
const modal = createModal({
  displayDelay: 3000 // Wait 3 seconds
});
await modal.start(script);
```

### Multiple Modals
```typescript
// Show different modals based on context
if (isFirstLogin) {
  await startModal(welcomeScript);
} else if (hasNewFeatures) {
  await startModal(whatsNewScript);
}
```

### Programmatic Control
```typescript
const modal = createModal();
await modal.start(script);

// Check if active
console.log(modal.isModalActive()); // true

// Get current step
console.log(modal.getCurrentStepIndex()); // 0

// Manually close
await modal.destroy();
```

## Styling

The modal comes with built-in responsive styles:
- Clean, modern design
- High contrast for readability
- Smooth animations and transitions
- Mobile-optimized layout

### Style Isolation
All styles are encapsulated in Shadow DOM. The modal won't affect your page styles and your page styles won't affect the modal.

## Best Practices

1. **Keep It Short**: 3-5 steps is ideal. Users lose interest quickly.

2. **Use Images Wisely**: Screenshots help but slow down loading. Use them for important steps only.

3. **Clear CTAs**: Use descriptive button text. "Next" is fine, but "Start Tutorial" is better for the first step.

4. **Respect Dismissal**: Once a user clicks "Don't show again", honor it. Only reset if you have major updates.

5. **Test on Mobile**: Always test your modal on mobile devices. Text and images should remain readable.

6. **Accessibility First**: Ensure all content is accessible via keyboard and screen readers.

7. **Analytics Review**: Check analytics regularly to see where users drop off. Adjust content accordingly.

## Troubleshooting

### Modal Not Appearing
- Check if script has `status: 'published'`
- Verify script has steps
- Check if user has dismissed it: `isDismissed(scriptId)`
- Look for console errors

### Images Not Loading
- Verify image URLs are accessible
- Check CORS settings if images are cross-origin
- Use HTTPS URLs in production

### Styling Issues
- Remember: Shadow DOM isolates styles
- Custom fonts need to be loaded in the host page
- Check browser console for CSS errors

### Performance
- Minimize image file sizes
- Use appropriate display delay
- Consider lazy-loading for multiple modals

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

Requires:
- Shadow DOM support
- ES6+ JavaScript
- localStorage

## Migration from Walkthrough

Modal and Walkthrough are complementary:

**Use Modal when:**
- Introducing the entire product
- Showing product tour without context
- Announcing new features
- Welcome screens

**Use Walkthrough when:**
- Teaching specific workflows
- Guiding through multi-step processes
- Highlighting specific UI elements
- Interactive training with element targeting

## API Reference

### Functions

**`startModal(script, config?): Promise<ModalComponent>`**
- Creates and starts a modal in one call
- Returns: ModalComponent instance

**`createModal(config?): ModalComponent`**
- Creates modal without starting
- Returns: ModalComponent instance

### ModalComponent Methods

**`start(script): Promise<void>`**
- Start the modal with a script

**`destroy(): Promise<void>`**
- Close and cleanup the modal

**`isModalActive(): boolean`**
- Check if modal is currently displayed

**`getCurrentStepIndex(): number`**
- Get current step index (0-based)

### Storage Functions

**`isDismissed(scriptId): boolean`**
- Check if user has dismissed this modal

**`markAsDismissed(scriptId, daysUntilExpiry?): void`**
- Mark modal as dismissed

**`clearDismissal(scriptId): void`**
- Remove dismissal record

## Examples

See the `examples/` directory for complete working examples:
- `basic-modal.html` - Simple modal example
- `advanced-modal.html` - Advanced configuration
- `conditional-display.html` - Conditional logic
- `analytics-tracking.html` - Analytics integration

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/your-org/next-step-js/issues)
- Documentation: [Full docs](https://docs.next-step.dev)
- Community: [Discussions](https://github.com/your-org/next-step-js/discussions)
