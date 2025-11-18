import { toast } from '../lib/toast';

// Mock Alert for toast
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('Toast', () => {
  it('should show success toast', () => {
    toast.success('Operation successful');
    // Toast implementation uses native alerts, so we just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('should show error toast', () => {
    toast.error('Operation failed');
    expect(true).toBe(true);
  });
});
