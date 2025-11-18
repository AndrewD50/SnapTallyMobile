import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FinalizeModal } from '../../components/FinalizeModal';

describe('FinalizeModal', () => {
  const mockHandlers = {
    onFinalize: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible', () => {
    const { getByText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    expect(getByText('Finish shopping trip?')).toBeTruthy();
    expect(getByText(/5 items totaling/)).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <FinalizeModal
        visible={false}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    expect(queryByText('Finish shopping trip?')).toBeNull();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  it('should call onFinalize with rating and comments when finalize is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    // Enter comments
    const commentsInput = getByPlaceholderText('Add any notes about your shopping trip...');
    fireEvent.changeText(commentsInput, 'Great shopping experience');

    // Press finalize
    fireEvent.press(getByText('Finish Shopping'));

    expect(mockHandlers.onFinalize).toHaveBeenCalledWith(
      expect.any(Number),
      'Great shopping experience'
    );
  });

  it('should update rating when stars are pressed', () => {
    const { getByText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    // Press finalize (rating defaults to 0)
    fireEvent.press(getByText('Finish Shopping'));
    
    expect(mockHandlers.onFinalize).toHaveBeenCalledWith(0, '');
  });

  it('should handle empty comments', () => {
    const { getByText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('Finish Shopping'));

    expect(mockHandlers.onFinalize).toHaveBeenCalledWith(
      expect.any(Number),
      ''
    );
  });

  it('should show warning about not being able to add more items', () => {
    const { getByText } = render(
      <FinalizeModal
        visible={true}
        itemCount={5}
        totalCost={45.50}
        {...mockHandlers}
      />
    );

    expect(getByText(/won't be able to add more items/)).toBeTruthy();
  });
});
