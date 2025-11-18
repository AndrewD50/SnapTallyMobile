# Test Suite Documentation

This project includes comprehensive unit and integration tests for all major functionality.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### API Tests (`api.test.ts`)
- ✅ Price tag analysis with base64 and file URIs
- ✅ Session creation and management
- ✅ Fetching all sessions and active sessions
- ✅ Item operations (add, update, delete)
- ✅ Session finalization with ratings and comments
- ✅ Session deletion
- ✅ Budget display toggling
- ✅ Shop name approval workflow
- ✅ Error handling for all API calls

### Component Tests

#### ItemCard Tests (`components/ItemCard.test.tsx`)
- ✅ Rendering item details (name, brand, price, weight)
- ✅ Quantity controls (increase/decrease)
- ✅ Total price calculation with multiple quantities
- ✅ Delete and edit functionality
- ✅ Incorrect scan indicators
- ✅ Debug mode controls

#### BudgetDisplay Tests (`components/BudgetDisplay.test.tsx`)
- ✅ Total and item count display
- ✅ Budget row visibility toggle
- ✅ Variance calculation (over/under budget)
- ✅ Budget toggle switch functionality
- ✅ Handling null/undefined/zero budgets

#### SessionHeader Tests (`components/SessionHeader.test.tsx`)
- ✅ Shop name and location display
- ✅ Back button navigation
- ✅ Finish button visibility (active sessions only)
- ✅ Finish button disabled state (when no items)
- ✅ Debug mode badge display
- ✅ Date formatting

#### SessionListItem Tests (`components/SessionListItem.test.tsx`)
- ✅ Session details rendering
- ✅ Item count display (singular/plural)
- ✅ Session selection
- ✅ Session deletion
- ✅ Active indicator for active sessions
- ✅ Date formatting

#### FinalizeModal Tests (`components/FinalizeModal.test.tsx`)
- ✅ Modal visibility
- ✅ Item count and total cost display
- ✅ Star rating functionality
- ✅ Comments input
- ✅ Cancel and finalize actions
- ✅ Form validation

#### EditItemDialog Tests (`components/EditItemDialog.test.tsx`)
- ✅ Modal rendering with item data
- ✅ Input field updates
- ✅ Save with updated values
- ✅ Field validation
- ✅ Numeric input handling

### Utility Tests

#### Image Compression Tests (`image-compression.test.ts`)
- ✅ Image compression with proper dimensions
- ✅ Base64 encoding
- ✅ Error handling for compression failures

#### Toast Tests (`toast.test.ts`)
- ✅ Success notifications
- ✅ Error notifications

### Integration Tests

#### ShoppingScreen Tests (`screens/ShoppingScreen.test.tsx`)
- ✅ Session loading on mount
- ✅ Shop name and location display
- ✅ Empty state rendering
- ✅ Back navigation
- ✅ Total item count calculation with quantities
- ✅ Item quantity updates
- ✅ Item deletion confirmation

## Test Structure

```
src/
  __tests__/
    api.test.ts                    # API function tests
    image-compression.test.ts       # Image compression utility tests
    toast.test.ts                   # Toast notification tests
    components/
      ItemCard.test.tsx             # Item card component tests
      BudgetDisplay.test.tsx        # Budget display tests
      SessionHeader.test.tsx        # Session header tests
      SessionListItem.test.tsx      # Session list item tests
      FinalizeModal.test.tsx        # Finalize modal tests
      EditItemDialog.test.tsx       # Edit item dialog tests
    screens/
      ShoppingScreen.test.tsx       # Shopping screen integration tests
```

## Key Test Features

### Mocking
- All Expo modules (camera, image picker, location, etc.) are mocked
- API calls are mocked for isolated component testing
- Navigation is mocked for screen tests

### Coverage Goals
- ✅ All API endpoints tested
- ✅ All major components tested
- ✅ User interactions tested
- ✅ Error states handled
- ✅ Edge cases covered

### Testing Libraries Used
- `@testing-library/react-native` - Component testing
- `jest` - Test runner and assertions
- `jest-expo` - Expo-specific Jest preset

## Writing New Tests

1. Create test file next to component: `Component.test.tsx`
2. Import testing utilities:
   ```typescript
   import { render, fireEvent, waitFor } from '@testing-library/react-native';
   ```
3. Mock external dependencies
4. Write descriptive test cases
5. Test user interactions and edge cases

## Continuous Integration

These tests can be integrated into CI/CD pipelines to ensure code quality:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## Next Steps

- [ ] Add E2E tests with Detox
- [ ] Increase coverage to 90%+
- [ ] Add visual regression tests
- [ ] Add performance tests
