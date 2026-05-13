import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export interface AuthUser {
  id: number;
  name: string | null;
  email: string;
  role: string;
  avatar?: string | null;
  walletAddress?: string | null;
  isVerified?: boolean;
  createdAt?: Date;
}

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user: AuthUser | null = useMemo(() => {
    if (oauthUser) {
      return {
        id: oauthUser.id,
        name: oauthUser.name,
        email: oauthUser.email || "",
        role: oauthUser.role,
        avatar: oauthUser.avatar,
        walletAddress: oauthUser.walletAddress,
        isVerified: oauthUser.isVerified,
        createdAt: oauthUser.createdAt,
      };
    }
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email || "",
        role: localUser.role,
        avatar: localUser.avatar,
        walletAddress: localUser.walletAddress,
        isVerified: localUser.isVerified,
        createdAt: localUser.createdAt,
      };
    }
    return null;
  }, [oauthUser, localUser]);

  const isLoading = oauthLoading || localLoading;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    logout,
  };
}
