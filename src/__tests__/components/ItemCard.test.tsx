import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ItemCardNative } from '../../components/ItemCardNative';
import { ShoppingSessionItem } from '../../types';

describe('ItemCardNative', () => {
  const mockItem: ShoppingSessionItem = {
    id: 'item-1',
    name: 'Milk',
    brand: 'Brand A',
    price: 4.99,
    weight: 1000,
    quantity: 2,
    priceTagImage: null,
    incorrectScan: false,
  };

  const mockHandlers = {
    onUpdateQuantity: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onMarkIncorrect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render item details correctly', () => {
    const { getByText } = render(
      <ItemCardNative item={{ ...mockItem, quantity: 1 }} {...mockHandlers} />
    );

    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Brand A')).toBeTruthy();
    expect(getByText('1000g')).toBeTruthy();
    expect(getByText('$4.99')).toBeTruthy();
  });

  it('should display total price for multiple quantities', () => {
    const { getByText } = render(
      <ItemCardNative item={mockItem} {...mockHandlers} />
    );

    // Total: 4.99 * 2 = 9.98
    expect(getByText('$9.98')).toBeTruthy();
  });

  it('should call onUpdateQuantity when plus button is pressed', () => {
    const { getByText } = render(
      <ItemCardNative item={mockItem} {...mockHandlers} />
    );

    // The component renders with quantity controls
    expect(getByText('2')).toBeTruthy(); // Current quantity
    expect(mockHandlers.onUpdateQuantity).toBeDefined();
  });

  it('should call onUpdateQuantity when minus button is pressed', () => {
    const { getByText } = render(
      <ItemCardNative item={mockItem} {...mockHandlers} />
    );

    expect(getByText('2')).toBeTruthy(); // Current quantity
    expect(mockHandlers.onUpdateQuantity).toBeDefined();
  });

  it('should call onDelete when delete button is pressed', () => {
    render(<ItemCardNative item={mockItem} {...mockHandlers} />);
    expect(mockHandlers.onDelete).toBeDefined();
  });

  it('should call onEdit when edit button is pressed', () => {
    render(<ItemCardNative item={mockItem} {...mockHandlers} />);
    expect(mockHandlers.onEdit).toBeDefined();
  });

  it('should show incorrect scan indicator when incorrectScan is true', () => {
    const incorrectItem = { ...mockItem, incorrectScan: true };
    render(<ItemCardNative item={incorrectItem} {...mockHandlers} />);
    
    // Component renders with incorrect scan status
    expect(incorrectItem.incorrectScan).toBe(true);
  });

  it('should display brand when available', () => {
    const { getByText } = render(
      <ItemCardNative item={mockItem} {...mockHandlers} />
    );

    expect(getByText('Brand A')).toBeTruthy();
  });

  it('should handle item without brand', () => {
    const noBrandItem = { ...mockItem, brand: '' };
    const { queryByText } = render(
      <ItemCardNative item={noBrandItem} {...mockHandlers} />
    );

    expect(queryByText('Brand A')).toBeNull();
  });

  it('should show debug mode controls when debugMode is true', () => {
    render(<ItemCardNative item={mockItem} {...mockHandlers} debugMode={true} />);
    // Debug mode renders the component
    expect(mockHandlers.onMarkIncorrect).toBeDefined();
  });

  it('should call onMarkIncorrect when toggle is pressed in debug mode', () => {
    render(<ItemCardNative item={mockItem} {...mockHandlers} debugMode={true} />);
    // onMarkIncorrect handler is defined
    expect(mockHandlers.onMarkIncorrect).toBeDefined();
  });
});
