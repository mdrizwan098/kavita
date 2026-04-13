import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { handleFirestoreError, OperationType } from '../lib/utils';

import { motion, AnimatePresence } from 'motion/react';

import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState<string>('all');
  const { isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const postsRef = collection(db, 'posts');
    let q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));

    if (langFilter !== 'all') {
      q = query(postsRef, where('language', '==', langFilter), orderBy('createdAt', 'desc'), limit(20));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [isAuthReady, langFilter]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-display italic text-primary/60"
        >
          Gathering words...
        </motion.div>
        <div className="w-12 h-px bg-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight italic">Recent Verses</h1>
          <p className="text-muted-foreground/60 text-sm mt-1 uppercase tracking-widest">Whispers from the soul</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
          <Filter className="h-4 w-4 text-primary/60" />
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="w-[100px] border-none shadow-none bg-transparent focus:ring-0 h-8 text-xs font-medium uppercase tracking-wider">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-primary/10">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Urdu">Urdu</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {posts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 space-y-4"
        >
          <p className="text-2xl text-muted-foreground/40 font-display italic">Silence is also poetry, but no verses found yet.</p>
          <div className="w-16 h-px bg-primary/10 mx-auto" />
        </motion.div>
      ) : (
        <div className="grid gap-16">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="group relative"
              >
                <div className="block space-y-6 relative">
                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl poetry-title group-hover:text-primary transition-all duration-500 group-hover:translate-x-2">
                      <Link to={`/post/${post.id}`} className="after:absolute after:inset-0 after:z-0">
                        {post.title}
                      </Link>
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                      <span className="text-primary/60">{post.language}</span>
                      <span className="w-1 h-1 rounded-full bg-primary/20" />
                      <span>{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) + ' ago' : 'Just now'}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-0 bottom-0 w-px bg-primary/10 group-hover:bg-primary/30 transition-colors" />
                    <p className="poetry-content text-muted-foreground/80 group-hover:text-foreground transition-colors duration-500 pl-4">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/5 relative z-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-primary/10 group-hover:border-primary/30 transition-colors">
                        <AvatarImage src={post.authorPhoto} alt={post.authorName} />
                        <AvatarFallback className="bg-primary/5 text-primary font-display text-xs">
                          {post.authorName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hover:text-primary transition-colors">
                        <Link to={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()}>{post.authorName}</Link>
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-muted-foreground/60">
                      <span className="flex items-center gap-2 text-xs group-hover:text-primary transition-colors">
                        <Heart className="h-4 w-4 group-hover:fill-current" /> {post.likesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
