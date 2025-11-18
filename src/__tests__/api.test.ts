import {
  analyzePriceTag,
  startShoppingSession,
  getAllSessions,
  getActiveSessions,
  getSession,
  addItemToSession,
  updateSessionItem,
  deleteSessionItem,
  finalizeSession,
  deleteSession,
  updateSession,
  getApprovedShopNames,
  submitShopName,
} from '../lib/api';

const API_BASE = 'https://dev-snaptally-api.redground-640c9f9b.australiaeast.azurecontainerapps.io/api';

describe('API Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('analyzePriceTag', () => {
    it('should analyze price tag successfully with base64', async () => {
      const mockResponse = {
        item: 'Milk',
        brand: 'Brand',
        price: 4.99,
        weight: 1000,
        ocrText: 'some text',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzePriceTag('file://image.jpg', 'base64data');

      expect(result).toEqual({
        name: 'Milk',
        brand: 'Brand',
        price: 4.99,
        weight: 1000,
        ocrText: 'some text',
        allPrices: undefined,
        allItems: undefined,
      });
    });

    it('should handle missing fields with defaults', async () => {
      const mockResponse = {
        price: '3.50',
        weight: '500',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzePriceTag('file://image.jpg');

      expect(result.name).toBe('Unknown Item');
      expect(result.brand).toBe('');
      expect(result.price).toBe(3.5);
      expect(result.weight).toBe(500);
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Error details',
      });

      await expect(analyzePriceTag('file://image.jpg')).rejects.toThrow(
        'Failed to analyze price tag'
      );
    });
  });

  describe('startShoppingSession', () => {
    it('should start a new shopping session', async () => {
      const mockSession = {
        id: 'session-1',
        shopName: 'Woolworths',
        location: 'Sydney',
        status: 'active',
        items: [],
        totalCost: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await startShoppingSession({
        shopName: 'Woolworths',
        location: 'Sydney',
        date: new Date().toISOString(),
      });

      expect(result.id).toBe('session-1');
      expect(result.shopName).toBe('Woolworths');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/start`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('getAllSessions', () => {
    it('should fetch all sessions', async () => {
      const mockSessions = [
        { id: '1', shopName: 'Store 1', status: 'active', items: [] },
        { id: '2', shopName: 'Store 2', status: 'finalized', items: [] },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await getAllSessions();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getActiveSessions', () => {
    it('should fetch only active sessions', async () => {
      const mockSessions = [
        { id: '1', shopName: 'Store 1', status: 'active', items: [] },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await getActiveSessions();

      expect(result).toHaveLength(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/active`,
        expect.any(Object)
      );
    });
  });

  describe('getSession', () => {
    it('should fetch a specific session by ID', async () => {
      const mockSession = {
        id: 'session-1',
        shopName: 'Woolworths',
        items: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await getSession('session-1');

      expect(result.id).toBe('session-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1`,
        expect.any(Object)
      );
    });
  });

  describe('addItemToSession', () => {
    it('should add an item to a session', async () => {
      const mockItem = {
        id: 'item-1',
        name: 'Milk',
        price: 4.99,
        quantity: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      const result = await addItemToSession('session-1', {
        name: 'Milk',
        price: 4.99,
        brand: '',
        weight: 1000,
        quantity: 1,
      });

      expect(result.id).toBe('item-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1/items`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('updateSessionItem', () => {
    it('should update an item quantity', async () => {
      const mockItem = {
        id: 'item-1',
        name: 'Milk',
        quantity: 2,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      const result = await updateSessionItem('session-1', 'item-1', {
        name: 'Milk',
        price: 4.99,
        brand: '',
        weight: 1000,
        quantity: 2,
      });

      expect(result.quantity).toBe(2);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1/items/item-1`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('deleteSessionItem', () => {
    it('should delete an item from session', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteSessionItem('session-1', 'item-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1/items/item-1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('finalizeSession', () => {
    it('should finalize a session with rating and comments', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'finalized',
        satisfactionRating: 5,
        comments: 'Great shopping trip',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await finalizeSession('session-1', {
        satisfactionRating: 5,
        comments: 'Great shopping trip',
      });

      expect(result.status).toBe('finalized');
      expect(result.satisfactionRating).toBe(5);
    });

    it('should finalize session without optional data', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'finalized',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await finalizeSession('session-1');

      expect(result.status).toBe('finalized');
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteSession('session-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('updateSession', () => {
    it('should update session settings', async () => {
      const mockSession = {
        id: 'session-1',
        displayBudget: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const result = await updateSession('session-1', { displayBudget: true });

      expect(result.displayBudget).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/Shop/session-1`,
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('getApprovedShopNames', () => {
    it('should fetch approved shop names', async () => {
      const mockShopNames = [
        { id: '1', name: 'Woolworths', isApproved: true },
        { id: '2', name: 'Coles', isApproved: true },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockShopNames,
      });

      const result = await getApprovedShopNames();

      expect(result).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/ShopNames/approved`,
        expect.any(Object)
      );
    });
  });

  describe('submitShopName', () => {
    it('should submit a new shop name for approval', async () => {
      const mockShopName = {
        id: '1',
        name: 'New Store',
        isApproved: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockShopName,
      });

      const result = await submitShopName({ name: 'New Store' });

      expect(result.name).toBe('New Store');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/ShopNames`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
