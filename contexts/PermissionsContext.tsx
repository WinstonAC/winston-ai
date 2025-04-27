import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AnalyticsPermissions, UsageLimits, getAnalyticsPermissions } from '../types/auth';
import { api } from '@/lib/api';

interface ApiResponse<T> {
  data: T;
  error?: Error;
}

interface PermissionsState {
  user: User | null;
  permissions: AnalyticsPermissions | null;
  isLoading: boolean;
  error: string | null;
}

type PermissionsAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PERMISSIONS'; payload: AnalyticsPermissions }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: PermissionsState = {
  user: null,
  permissions: null,
  isLoading: true,
  error: null,
};

interface PermissionsContextType {
  state: PermissionsState;
  dispatch: React.Dispatch<PermissionsAction>;
  checkPermission: (permission: keyof AnalyticsPermissions) => boolean;
  checkDataAccess: (requiredLevel: string) => boolean;
  checkUsageLimit: (feature: keyof UsageLimits) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

const permissionsReducer = (state: PermissionsState, action: PermissionsAction): PermissionsState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        permissions: getAnalyticsPermissions(action.payload),
        error: null,
      };
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

const fetchUserData = async (): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<User>>('/api/user');
    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(permissionsReducer, initialState);

  const checkPermission = (permission: keyof AnalyticsPermissions): boolean => {
    if (!state.permissions) return false;
    return state.permissions[permission] === true;
  };

  const checkDataAccess = (requiredLevel: string): boolean => {
    if (!state.permissions) return false;
    const accessLevels = ['own', 'team', 'department', 'organization'];
    const userLevel = accessLevels.indexOf(state.permissions.dataAccessLevel);
    const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
    return userLevel >= requiredLevelIndex;
  };

  const checkUsageLimit = (feature: keyof UsageLimits): boolean => {
    if (!state.permissions) return false;
    // This would typically check against actual usage in your database
    // For now, we'll just return true if the limit is greater than 0
    return state.permissions.usageLimits[feature] > 0;
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const user = await fetchUserData();
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  return (
    <PermissionsContext.Provider
      value={{
        state,
        dispatch,
        checkPermission,
        checkDataAccess,
        checkUsageLimit,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Example usage component
export const PermissionGuard: React.FC<{
  requiredPermission: keyof AnalyticsPermissions;
  requiredDataAccess?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ requiredPermission, requiredDataAccess, children, fallback }) => {
  const { checkPermission, checkDataAccess } = usePermissions();

  if (requiredDataAccess && !checkDataAccess(requiredDataAccess)) {
    return <>{fallback || null}</>;
  }

  if (!checkPermission(requiredPermission)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}; 