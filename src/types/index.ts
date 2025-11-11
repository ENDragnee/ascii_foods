export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string | null;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  sessionId: string;
  expiresAt: Date;
}
