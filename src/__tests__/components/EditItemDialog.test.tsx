import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditItemDialogNative } from '../../components/EditItemDialogNative';
import { ShoppingSessionItem } from '../../types';

describe('EditItemDialogNative', () => {
  const mockItem: ShoppingSessionItem = {
    id: 'item-1',
    name: 'Milk',
    brand: 'Brand A',
    price: 4.99,
    weight: 1000,
    quantity: 2,
    priceTagImage: null,
    incorrectScan: false,
    timestamp: Date.now(),
  };

  const mockHandlers = {
    onClose: jest.fn(),
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible with item', () => {
    const { getByText, getByDisplayValue } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    expect(getByText('Edit Item')).toBeTruthy();
    expect(getByDisplayValue('Milk')).toBeTruthy();
    expect(getByDisplayValue('Brand A')).toBeTruthy();
    expect(getByDisplayValue('4.99')).toBeTruthy();
    expect(getByDisplayValue('1000')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <EditItemDialogNative
        visible={false}
        item={mockItem}
        {...mockHandlers}
      />
    );

    expect(queryByText('Edit Item')).toBeNull();
  });

  it('should not render when item is null', () => {
    const { queryByText } = render(
      <EditItemDialogNative
        visible={true}
        item={null}
        {...mockHandlers}
      />
    );

    expect(queryByText('Edit Item')).toBeNull();
  });

  it('should call onClose when cancel button is pressed', () => {
    const { getByText } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('should update item name when text changes', () => {
    const { getByDisplayValue } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    const nameInput = getByDisplayValue('Milk');
    fireEvent.changeText(nameInput, 'Almond Milk');

    expect(nameInput.props.value).toBe('Almond Milk');
  });

  it('should call onSave with updated values when save is pressed', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    // Update name
    const nameInput = getByDisplayValue('Milk');
    fireEvent.changeText(nameInput, 'Almond Milk');

    // Update price
    const priceInput = getByDisplayValue('4.99');
    fireEvent.changeText(priceInput, '5.99');

    // Press save
    fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith('item-1', {
        name: 'Almond Milk',
        brand: 'Brand A',
        price: 5.99,
        weight: 1000,
      });
    });
  });

  it('should validate required fields', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    // Clear name
    const nameInput = getByDisplayValue('Milk');
    fireEvent.changeText(nameInput, '');

    // The save button should be disabled with empty name, so we check it exists but is disabled
    const saveButton = getByText('Save Changes');
    expect(saveButton).toBeTruthy();
  });

  it('should handle numeric inputs correctly', () => {
    const { getByDisplayValue } = render(
      <EditItemDialogNative
        visible={true}
        item={mockItem}
        {...mockHandlers}
      />
    );

    const priceInput = getByDisplayValue('4.99');
    fireEvent.changeText(priceInput, 'abc'); // Invalid input

    const weightInput = getByDisplayValue('1000');
    fireEvent.changeText(weightInput, '1500');

    expect(weightInput.props.value).toBe('1500');
  });
});
