
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  data: {
    session: Session | null;
  };
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  data: {
    session: null
  },
  handleSignIn: async () => {},
  handleLogout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        navigate('/');
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (!session) {
        navigate('/');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000
      });
      return;
    }
    
    if (data.session) {
      navigate('/dashboard');
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }
    
    navigate('/');
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        data: { session },
        handleSignIn,
        handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
