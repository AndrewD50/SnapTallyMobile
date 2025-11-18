import { PriceTagAnalysisResponse, ShoppingSession, StartSessionRequest, AddItemRequest, ShoppingSessionItem, ShopName, ShopNameSubmission } from '@/types'

const API_BASE = 'https://dev-snaptally-api.redground-640c9f9b.australiaeast.azurecontainerapps.io/api'
const API_KEY = 'dev-temp-key-12345'

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
}

function normalizeSession(session: any): ShoppingSession {
  return {
    ...session,
    isActive: session.isActive ?? (session.active === 'active'),
  }
}

export async function analyzePriceTag(imageUri: string, base64?: string): Promise<PriceTagAnalysisResponse> {
  const formData = new FormData();
  
  // For React Native with base64, use data URI format
  if (base64) {
    formData.append('image', {
      uri: `data:image/jpeg;base64,${base64}`,
      type: 'image/jpeg',
      name: 'price-tag.jpg',
    } as any);
  } else {
    // Fallback to file URI
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'price-tag.jpg',
    } as any);
  }

  const response = await fetch(`${API_BASE}/PriceTag/analyze`, {
    method: 'POST',
    body: formData,
    headers: {
      'X-API-Key': API_KEY,
      // Don't set Content-Type for multipart/form-data, let the browser/RN set it with boundary
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to analyze price tag: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  return {
    name: data.item || 'Unknown Item',
    brand: data.brand || '',
    price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
    weight: typeof data.weight === 'number' ? data.weight : parseFloat(data.weight) || 0,
    ocrText: data.ocrText,
    allPrices: data.allPrices,
    allItems: data.allItems,
  };
}

export async function startShoppingSession(request: StartSessionRequest): Promise<ShoppingSession> {
  const response = await fetch(`${API_BASE}/Shop/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return normalizeSession(data)
}

export async function getAllSessions(): Promise<ShoppingSession[]> {
  const response = await fetch(`${API_BASE}/Shop`, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.map(normalizeSession)
}

export async function getActiveSessions(): Promise<ShoppingSession[]> {
  const response = await fetch(`${API_BASE}/Shop/active`, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch active sessions: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.map(normalizeSession)
}

export async function getSession(sessionId: string): Promise<ShoppingSession> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}`, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return normalizeSession(data)
}

export async function searchSessions(query: string): Promise<ShoppingSession[]> {
  if (!query.trim()) {
    return [];
  }

  // Split search query into words
  const words = query.trim().split(/\s+/).filter(word => word);

  // Build search params - add each word as both shopName and location
  const params = new URLSearchParams();
  
  if (words.length > 0) {
    words.forEach(word => {
      params.append('shopName', word);
      params.append('location', word);
    });
  }
  
  const response = await fetch(`${API_BASE}/Shop/search?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to search sessions: ${response.status} ${response.statusText}`)
  }

  const data = await response.json();
  const sessions = data.map(normalizeSession);

  // If multiple words, only show sessions that match ALL words
  if (words.length > 1) {
    return sessions.filter((session: ShoppingSession) => {
      const shopNameLower = session.shopName.toLowerCase();
      const locationLower = session.location.toLowerCase();
      
      // Check if all words appear in either shopName or location (or combination)
      return words.every(word => {
        const wordLower = word.toLowerCase();
        return shopNameLower.includes(wordLower) || locationLower.includes(wordLower);
      });
    });
  }

  // Otherwise return all matches
  return sessions;
}

export async function addItemToSession(sessionId: string, item: AddItemRequest): Promise<ShoppingSessionItem> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    throw new Error(`Failed to add item: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function updateSessionItem(sessionId: string, itemId: string, item: AddItemRequest): Promise<ShoppingSessionItem> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}/items/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    throw new Error(`Failed to update item: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function deleteSessionItem(sessionId: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}/items/${itemId}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to delete item: ${response.status} ${response.statusText}`)
  }
}

export async function finalizeSession(sessionId: string, data?: { satisfactionRating?: number; comments?: string }): Promise<ShoppingSession> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}/finalize`, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Failed to finalize session: ${response.status} ${response.statusText}`)
  }

  const responseData = await response.json()
  return normalizeSession(responseData)
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.status} ${response.statusText}`)
  }
}

export async function updateSession(sessionId: string, data: { displayBudget?: boolean }): Promise<ShoppingSession> {
  const response = await fetch(`${API_BASE}/Shop/${sessionId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update session: ${response.status} ${response.statusText}`)
  }

  const responseData = await response.json()
  return normalizeSession(responseData)
}

export async function getApprovedShopNames(): Promise<ShopName[]> {
  const response = await fetch(`${API_BASE}/ShopNames/approved`, {
    headers: {
      'Accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch approved shop names: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function submitShopName(submission: ShopNameSubmission): Promise<ShopName> {
  const response = await fetch(`${API_BASE}/ShopNames`, {
    method: 'POST',
    headers,
    body: JSON.stringify(submission),
  })

  if (!response.ok) {
    throw new Error(`Failed to submit shop name: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
