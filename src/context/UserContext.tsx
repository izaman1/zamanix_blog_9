import React, { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_COINS = 10;

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  status: string;
}

interface Event {
  id: string;
  date: string;
  occasion: string;
  name?: string;
  notes?: string;
  recurrence: 'once' | 'weekly' | 'monthly' | 'yearly';
}

interface User {
  name: string;
  email: string;
  coins: number;
  lastLoginDate: string;
  loginStreak: number;
  addresses: Address[];
  orders: Order[];
  phone?: string;
  signupMethod: 'manual';
  events: Event[];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  addCoins: (amount: number) => void;
  checkDailyLogin: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (data: { name: string; email: string; password: string; phone: string }) => boolean;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateUserDetails: (details: Partial<User>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Admin user data
const ADMIN_USER = {
  email: 'admin@zamanix.com',
  password: 'zamanix_admin',
  userData: {
    name: 'Admin',
    email: 'admin@zamanix.com',
    coins: INITIAL_COINS,
    lastLoginDate: new Date().toISOString().split('T')[0],
    loginStreak: 1,
    addresses: [],
    orders: [],
    signupMethod: 'manual' as const,
    events: []
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    // Check for admin login
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      setUser(ADMIN_USER.userData);
      return true;
    }

    // Check regular user login
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userRecord = users[email];
    
    if (userRecord && userRecord.password === password) {
      const today = new Date().toISOString().split('T')[0];
      const wasYesterday = userRecord.lastLoginDate === new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const userData = {
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        coins: userRecord.coins || INITIAL_COINS,
        lastLoginDate: today,
        loginStreak: wasYesterday ? (userRecord.loginStreak || 1) + 1 : 1,
        addresses: userRecord.addresses || [],
        orders: userRecord.orders || [],
        signupMethod: 'manual' as const,
        events: userRecord.events || []
      };
      
      setUser(userData);
      
      // Update user data in storage
      users[email] = {
        ...userRecord,
        ...userData,
        password: userRecord.password
      };
      localStorage.setItem('users', JSON.stringify(users));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (data: { name: string; email: string; password: string; phone: string }): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[data.email]) {
      return false; // User already exists
    }

    const userData = {
      ...data,
      coins: INITIAL_COINS, // Initial coins for new users
      lastLoginDate: new Date().toISOString().split('T')[0],
      loginStreak: 1,
      addresses: [],
      orders: [],
      events: [],
      signupMethod: 'manual' as const
    };

    // Save user data
    users[data.email] = userData;
    localStorage.setItem('users', JSON.stringify(users));

    // Log user in
    setUser(userData);

    return true;
  };

  const addCoins = (amount: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        coins: user.coins + amount
      };
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email].coins = updatedUser.coins;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const checkDailyLogin = () => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      if (user.lastLoginDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = user.lastLoginDate === yesterday.toISOString().split('T')[0];
        
        const updatedUser = {
          ...user,
          lastLoginDate: today,
          loginStreak: wasYesterday ? user.loginStreak + 1 : 1,
          coins: user.coins + (wasYesterday ? user.loginStreak + 1 : 1)
        };
        
        setUser(updatedUser);

        // Update in users storage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[user.email]) {
          users[user.email] = {
            ...users[user.email],
            lastLoginDate: updatedUser.lastLoginDate,
            loginStreak: updatedUser.loginStreak,
            coins: updatedUser.coins
          };
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (user) {
      const newAddress = {
        ...address,
        id: Date.now().toString()
      };

      const updatedUser = {
        ...user,
        addresses: [...user.addresses, newAddress]
      };
      
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email].addresses = updatedUser.addresses;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const updateUserDetails = (details: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...details
      };
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email] = {
          ...users[user.email],
          name: details.name || users[user.email].name,
          phone: details.phone || users[user.email].phone
        };
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    if (user) {
      const newEvent = {
        ...event,
        id: Date.now().toString()
      };

      const updatedUser = {
        ...user,
        events: [...user.events, newEvent]
      };
      
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email].events = updatedUser.events;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const updateEvent = (id: string, eventUpdates: Partial<Event>) => {
    if (user && user.events) {
      const updatedEvents = user.events.map(event =>
        event.id === id ? { ...event, ...eventUpdates } : event
      );

      const updatedUser = {
        ...user,
        events: updatedEvents
      };
      
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email].events = updatedEvents;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  const deleteEvent = (id: string) => {
    if (user && user.events) {
      const updatedEvents = user.events.filter(event => event.id !== id);

      const updatedUser = {
        ...user,
        events: updatedEvents
      };
      
      setUser(updatedUser);

      // Update in users storage
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (users[user.email]) {
        users[user.email].events = updatedEvents;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      addCoins,
      checkDailyLogin,
      login,
      logout,
      signup,
      addAddress,
      updateUserDetails,
      addEvent,
      updateEvent,
      deleteEvent
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}