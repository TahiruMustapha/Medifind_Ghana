"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    requiresTwoFactor?: boolean;
    email?: string;
  }>;
  register: (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role?: string
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
  }>;
  logout: () => Promise<void>;
  verifyAccount: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyTwoFactor: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  enableTwoFactor: (
    enable: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  getTwoFactorStatus: () => Promise<{
    enabled: boolean;
    phoneNumber: string | null;
    error?: string;
  }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  }, []);

// For Next.js 15+ with App Router
useEffect(() => {
  // Initial auth check
  const checkAuth = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error("Error checking authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();

  // For App Router in Next.js 15+, we need to use the Navigation API
  // or pathname changes to detect navigation
  if (typeof window !== 'undefined') {
    // Create a pathname state to detect changes
    let previousPathname = window.location.pathname;
    
    // Create a MutationObserver to watch for DOM changes that might indicate navigation
    const observer = new MutationObserver(() => {
      const currentPathname = window.location.pathname;
      if (previousPathname !== currentPathname) {
        previousPathname = currentPathname;
        if (!loading) {
          refreshUser();
        }
      }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }
}, [refreshUser, loading]);


  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requiresTwoFactor) {
          return {
            success: false,
            requiresTwoFactor: true,
            email: data.email,
          };
        }

        // Instead of directly setting user from response,
        // refresh user data from server to ensure consistency
        await refreshUser();
        return { success: true };
      } else if (res.status === 403 && data.requiresVerification) {
        return {
          success: false,
          error: "Account not verified",
          requiresVerification: true,
          email: data.email,
        };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    role = "user"
  ) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phoneNumber, role }),
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          requiresVerification: data.requiresVerification,
        };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const verifyAccount = async (email: string, code: string) => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh user data instead of directly setting from response
        await refreshUser();
        return { success: true };
      } else {
        return { success: false, error: data.error || "Verification failed" };
      }
    } catch (error) {
      console.error("Verification error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to resend verification code",
        };
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const verifyTwoFactor = async (email: string, code: string) => {
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh user data instead of directly setting from response
        await refreshUser();
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Two-factor verification failed",
        };
      }
    } catch (error) {
      console.error("Two-factor verification error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const enableTwoFactor = async (enable: boolean) => {
    try {
      const res = await fetch("/api/users/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh user to update twoFactorEnabled status
        await refreshUser();
        return { success: true };
      } else {
        return {
          success: false,
          error:
            data.error || "Failed to update two-factor authentication settings",
        };
      }
    } catch (error) {
      console.error("Error updating two-factor settings:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const getTwoFactorStatus = async () => {
    try {
      const res = await fetch("/api/users/2fa");
      const data = await res.json();
      if (res.ok) {
        return {
          enabled: data.enabled,
          phoneNumber: data.phoneNumber,
        };
      } else {
        return {
          enabled: false,
          phoneNumber: null,
          error:
            data.error || "Failed to fetch two-factor authentication status",
        };
      }
    } catch (error) {
      console.error("Error fetching two-factor status:", error);
      return {
        enabled: false,
        phoneNumber: null,
        error: "An unexpected error occurred",
      };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to request password reset",
        };
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh user after password reset in case user is logged in
        await refreshUser();
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to reset password",
        };
      }
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        login,
        register,
        logout,
        verifyAccount,
        resendVerificationCode,
        verifyTwoFactor,
        enableTwoFactor,
        getTwoFactorStatus,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
