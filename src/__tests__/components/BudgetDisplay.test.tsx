import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BudgetDisplay } from '../../components/BudgetDisplay';

describe('BudgetDisplay', () => {
  const mockOnToggleBudget = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render total and item count', () => {
    const { getByText } = render(
      <BudgetDisplay
        budgetEstimate={null}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(getByText('$25.50')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
    expect(getByText('Items')).toBeTruthy();
  });

  it('should show budget row when budget is set and showBudget is true', () => {
    const { getByText } = render(
      <BudgetDisplay
        budgetEstimate={50.00}
        totalCost={25.50}
        itemCount={5}
        showBudget={true}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(getByText('$50.00')).toBeTruthy();
  });

  it('should hide budget row when showBudget is false', () => {
    const { queryByText } = render(
      <BudgetDisplay
        budgetEstimate={50.00}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(queryByText('$50.00')).toBeNull();
  });

  it('should show variance when over budget', () => {
    const { getByText } = render(
      <BudgetDisplay
        budgetEstimate={20.00}
        totalCost={25.50}
        itemCount={5}
        showBudget={true}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(getByText('Difference')).toBeTruthy();
    expect(getByText('+$5.50')).toBeTruthy();
  });

  it('should show variance when under budget', () => {
    const { getByText } = render(
      <BudgetDisplay
        budgetEstimate={50.00}
        totalCost={25.50}
        itemCount={5}
        showBudget={true}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(getByText('Difference')).toBeTruthy();
    expect(getByText('$24.50')).toBeTruthy();
  });

  it('should call onToggleBudget when switch is toggled', () => {
    const { getByRole } = render(
      <BudgetDisplay
        budgetEstimate={50.00}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    const toggle = getByRole('switch');
    fireEvent(toggle, 'onValueChange', true);

    expect(mockOnToggleBudget).toHaveBeenCalledWith(true);
  });

  it('should not show budget toggle when no budget is set', () => {
    const { queryByRole } = render(
      <BudgetDisplay
        budgetEstimate={null}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(queryByRole('switch')).toBeNull();
  });

  it('should handle zero budget estimate', () => {
    const { queryByRole } = render(
      <BudgetDisplay
        budgetEstimate={0}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(queryByRole('switch')).toBeNull();
  });

  it('should handle undefined budget estimate', () => {
    const { queryByRole } = render(
      <BudgetDisplay
        budgetEstimate={undefined}
        totalCost={25.50}
        itemCount={5}
        showBudget={false}
        onToggleBudget={mockOnToggleBudget}
      />
    );

    expect(queryByRole('switch')).toBeNull();
  });
});
