import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { auth, db } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Add refs to track loading state and prevent race conditions
  const isLoadingProfile = useRef(false);
  const profileLoadAttempts = useRef(0);
  const maxProfileLoadAttempts = 3;
  const authInitialized = useRef(false);

  // Enhanced profile loading with better error handling and race condition prevention
  const loadUserProfile = async (userId, attempt = 1) => {
    // Prevent multiple simultaneous profile loads
    if (isLoadingProfile.current) {
      return;
    }

    try {
      isLoadingProfile.current = true;
      profileLoadAttempts.current = attempt;
      
      // Loading profile for user
      
      // Step 1: Verify user session is still valid
      const { data: { session }, error: sessionError } = await auth.getSession();
      if (sessionError || !session || session.user?.id !== userId) {
        throw new Error('Invalid session during profile load');
      }

      // Step 2: Test basic connectivity first
      const { error: connectivityError } = await db.supabase
        .from('system_settings')
        .select('count', { count: 'exact', head: true });
      
      if (connectivityError) {
        throw new Error(`Database connectivity failed: ${connectivityError.message}`);
      }

      // Step 3: Check if user exists in users table first and check password change requirement
      const { data: userData } = await db.getUser(userId);

      // Check if user must change password
      if (userData && userData.must_change_password) {
        setMustChangePassword(true);
      } else {
        setMustChangePassword(false);
      }

      // Step 4: Load profile with enhanced timeout and logging
      // Load profile with timeout
      
      // Create a more robust timeout mechanism
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Profile load timeout after 8 seconds (attempt ${attempt})`));
        }, 8000); // Increased timeout to 8 seconds
      });
      
      const profilePromise = db.getProfile(userId).then(result => {
        // Clear timeout on successful completion
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return result;
      });
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error) {
        // If it's a timeout and we haven't exceeded max attempts, retry
        if (error.message.includes('timeout') && attempt < maxProfileLoadAttempts) {
          isLoadingProfile.current = false; // Reset loading flag for retry
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return loadUserProfile(userId, attempt + 1);
        }
        
        // If no profile exists (PGRST116), create user and profile automatically
        if (error.code === 'PGRST116') {
          try {
            // First, ensure user exists in public.users table
            const newUser = {
              id: userId,
              email: user?.email || session?.user?.email,
              role: user?.user_metadata?.role || session?.user?.user_metadata?.role || 'client',
              is_active: true
            };
            
            const { error: userCreateError } = await db.supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();
            
            if (userCreateError && userCreateError.code !== '23505') { // 23505 is duplicate key (user already exists)
              throw userCreateError;
            }
            
            // Now create the profile
            const newProfile = {
              user_id: userId,
              role: user?.user_metadata?.role || session?.user?.user_metadata?.role || 'client',
              first_name: user?.user_metadata?.first_name || session?.user?.user_metadata?.first_name || 'User',
              last_name: user?.user_metadata?.last_name || session?.user?.user_metadata?.last_name || '',
              profile_completed: false,
              onboarding_step: 0,
              is_active: true
            };
            
            const { data: createdProfile, error: createProfileError } = await db.supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
            
            if (createProfileError) {
              throw createProfileError;
            }
            
            setProfile(createdProfile);
            return;
          } catch {
            // Fall through to fallback profile creation
          }
        }
        
        // Create fallback profile from user metadata
        const fallbackProfile = {
          user_id: userId,
          role: user?.user_metadata?.role || session?.user?.user_metadata?.role || 'client',
          first_name: user?.user_metadata?.first_name || session?.user?.user_metadata?.first_name || 'User',
          last_name: user?.user_metadata?.last_name || session?.user?.user_metadata?.last_name || '',
          email: user?.email || session?.user?.email,
          profile_completed: false,
          onboarding_step: 0,
          is_active: true
        };
        setProfile(fallbackProfile);
        return;
      }
      
      // Step 5: Enhance profile with user role if available
      if (userData && !error) {
        data.user_role = userData.role;
      }
      setProfile(data);
      
    } catch (error) {
      // If it's a network/connectivity error and we haven't exceeded max attempts, retry
      if ((error.message.includes('network') || error.message.includes('connectivity') || error.message.includes('timeout')) 
          && attempt < maxProfileLoadAttempts) {
        isLoadingProfile.current = false; // Reset loading flag for retry
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return loadUserProfile(userId, attempt + 1);
      }
      
      // Create fallback profile from user metadata or session
      const { data: { session } } = await auth.getSession();
      const fallbackProfile = {
        user_id: userId,
        role: user?.user_metadata?.role || session?.user?.user_metadata?.role || 'client',
        first_name: user?.user_metadata?.first_name || session?.user?.user_metadata?.first_name || 'User',
        email: user?.email || session?.user?.email
      };
      setProfile(fallbackProfile);
    } finally {
      isLoadingProfile.current = false;
    }
  };

  // Initialize auth state with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (authInitialized.current) {
        return;
      }
      
      try {
        authInitialized.current = true;
        
        const { data: { session }, error: sessionError } = await auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        
        if (session?.user && isMounted) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with debouncing
    let authChangeTimeout;
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      // Clear any pending auth change processing
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      
      // Debounce auth state changes to prevent rapid-fire calls
      authChangeTimeout = setTimeout(async () => {
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }, 100); // 100ms debounce
    });

    return () => {
      isMounted = false;
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Sign up new user
  const signUp = async (email, password, profileData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signUp(email, password, {
        data: profileData
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setMustChangePassword(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      const { error } = await auth.resetPassword(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error };
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { data, error } = await db.updateProfile(user.id, updates);
      if (error) throw error;
      
      setProfile(prev => ({ ...prev, ...updates }));
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    }
  };

  // Memoized admin status to prevent excessive function calls
  const isAdmin = useMemo(() => {
    return profile?.role === 'admin' || profile?.user_role === 'admin' || user?.user_metadata?.role === 'admin';
  }, [profile?.role, profile?.user_role, user?.user_metadata?.role]);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    mustChangePassword,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin,
    isAuthenticated,
    setError,
    // Debug utilities
    profileLoadAttempts: profileLoadAttempts.current,
    isLoadingProfile: isLoadingProfile.current
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};