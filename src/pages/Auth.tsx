import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          username: result.user.displayName || 'Poet',
          photoURL: result.user.photoURL,
          bio: '',
          createdAt: new Date(),
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    try {
      if (type === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          username: username || 'Poet',
          bio: '',
          createdAt: new Date(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error) {
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto pt-10"
    >
      <div className="sayar-card p-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold italic">Kavita</h1>
          <p className="text-muted-foreground/60 text-xs uppercase tracking-[0.3em]">Enter the Sanctuary</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-primary/5 p-1">
            <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-display italic">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-display italic">Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium ml-1">Email Address</label>
                <Input type="email" placeholder="your@soul.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium ml-1">Secret Key</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 h-12" />
              </div>
              <Button className="w-full rounded-full h-12 text-lg font-display shadow-lg shadow-primary/10" onClick={() => handleEmailAuth('login')} disabled={loading}>
                {loading ? 'Opening...' : 'Enter'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="mt-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium ml-1">Pen Name</label>
                <Input placeholder="How shall we call you?" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium ml-1">Email Address</label>
                <Input type="email" placeholder="your@soul.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-medium ml-1">Secret Key</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20 h-12" />
              </div>
              <Button className="w-full rounded-full h-12 text-lg font-display shadow-lg shadow-primary/10" onClick={() => handleEmailAuth('signup')} disabled={loading}>
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/10"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
            <span className="bg-card px-4 text-muted-foreground/40">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full h-12 border-primary/10 hover:bg-primary/5 transition-all"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
      </div>
    </motion.div>
  );
};
