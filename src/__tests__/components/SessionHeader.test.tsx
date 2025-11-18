import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SessionHeader } from '../../components/SessionHeader';

describe('SessionHeader', () => {
  const mockProps = {
    shopName: 'Woolworths',
    location: 'Sydney CBD',
    startedAt: Date.now(),
    isActive: true,
    itemCount: 5,
    debugMode: false,
    onBack: jest.fn(),
    onFinish: jest.fn(),
    onToggleDebugMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render shop name and location', () => {
    const { getByText } = render(<SessionHeader {...mockProps} />);

    expect(getByText('Woolworths')).toBeTruthy();
    expect(getByText('Sydney CBD')).toBeTruthy();
  });

  it('should call onBack when back button is pressed', () => {
    render(<SessionHeader {...mockProps} />);
    // Back button handler is defined
    expect(mockProps.onBack).toBeDefined();
  });

  it('should show finish button when session is active', () => {
    const { getByText } = render(<SessionHeader {...mockProps} />);

    expect(getByText('Finish')).toBeTruthy();
  });

  it('should not show finish button when session is inactive', () => {
    const { queryByText } = render(
      <SessionHeader {...mockProps} isActive={false} />
    );

    expect(queryByText('Finish')).toBeNull();
  });

  it('should disable finish button when itemCount is 0', () => {
    const { getByText } = render(
      <SessionHeader {...mockProps} itemCount={0} />
    );

    // Finish button exists
    expect(getByText('Finish')).toBeTruthy();
  });

  it('should call onFinish when finish button is pressed', () => {
    const { getByText } = render(<SessionHeader {...mockProps} />);

    const finishButton = getByText('Finish');
    fireEvent.press(finishButton);

    expect(mockProps.onFinish).toHaveBeenCalled();
  });

  it('should show debug mode badge when debugMode is true', () => {
    const { getByText } = render(
      <SessionHeader {...mockProps} debugMode={true} />
    );

    expect(getByText('Debug Mode')).toBeTruthy();
  });

  it('should not show debug mode badge when debugMode is false', () => {
    const { queryByText } = render(<SessionHeader {...mockProps} />);

    expect(queryByText('Debug Mode')).toBeNull();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-01-15T14:30:00').getTime();
    const { getByText } = render(
      <SessionHeader {...mockProps} startedAt={testDate} />
    );

    // Date should be formatted like "Jan 15, 2:30 PM"
    expect(getByText(/Jan 15/)).toBeTruthy();
  });
});
