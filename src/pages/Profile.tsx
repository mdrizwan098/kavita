import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, collection, query, where, orderBy, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Edit2, Check, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';

import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  const { userId } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          setEditUsername(data.username);
          setEditBio(data.bio || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    };

    fetchProfile();

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
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
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        username: editUsername,
        bio: editBio,
      });
      setProfile({ ...profile, username: editUsername, bio: editBio });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-display italic text-primary/60"
      >
        Reading the poet's journal...
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-16"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Avatar className="h-32 w-32 border-2 border-primary/10 p-1">
            <AvatarImage src={profile?.photoURL} className="rounded-full" />
            <AvatarFallback className="text-4xl bg-primary/5 text-primary font-display">{profile?.username?.charAt(0)}</AvatarFallback>
          </Avatar>
        </motion.div>
        
        {isEditing ? (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm space-y-4 bg-primary/5 p-6 rounded-3xl border border-primary/10"
          >
            <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Username" className="bg-background" />
            <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about your soul..." className="bg-background min-h-[100px]" />
            <div className="flex justify-center gap-2">
              <Button size="sm" onClick={handleUpdateProfile} className="rounded-full px-6"><Check className="h-4 w-4 mr-2" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full px-6"><X className="h-4 w-4 mr-2" /> Cancel</Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-bold flex items-center justify-center gap-3 italic">
              {profile?.username}
              {isOwnProfile && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 text-primary/60" />
                </Button>
              )}
            </h1>
            <p className="text-xl text-muted-foreground/80 italic max-w-md mx-auto leading-relaxed">
              {profile?.bio || "A silent observer of life's beauty."}
            </p>
          </div>
        )}

        <div className="flex gap-12 pt-6">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">{posts.length}</p>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">Verses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">{posts.reduce((acc, p) => acc + (p.likesCount || 0), 0)}</p>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">Appreciations</p>
          </div>
        </div>
      </div>

      <div className="space-y-12 pt-12 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold italic">Collected Works</h2>
          <div className="w-24 h-px bg-primary/10" />
        </div>
        
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground/40 italic py-20 text-xl">No verses shared yet.</p>
        ) : (
          <div className="grid gap-12">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/post/${post.id}`} className="group block">
                  <div className="sayar-card hover:bg-primary/5">
                    <div className="space-y-4">
                      <h3 className="text-2xl poetry-title group-hover:text-primary transition-colors">{post.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>{post.language}</span>
                        <span className="w-1 h-1 rounded-full bg-primary/20" />
                        <span>{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) + ' ago' : 'Just now'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary/60">
                        <Heart className="h-4 w-4 group-hover:fill-current" />
                        <span className="font-display">{post.likesCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
