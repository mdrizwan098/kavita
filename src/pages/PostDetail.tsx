import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, increment, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Heart, ArrowLeft, Edit2, Trash2, Share2 } from 'lucide-react';
import { handleFirestoreError, OperationType, cn } from '../lib/utils';

import { motion } from 'motion/react';

import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const unsubscribe = onSnapshot(doc(db, 'posts', postId), (snapshot) => {
      if (snapshot.exists()) {
        setPost({ id: snapshot.id, ...snapshot.data() });
      } else {
        navigate('/');
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${postId}`);
    });

    return () => unsubscribe();
  }, [postId]);

  useEffect(() => {
    if (!user || !postId) return;

    const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
    const unsubscribe = onSnapshot(likeRef, (snapshot) => {
      setIsLiked(snapshot.exists());
    });

    return () => unsubscribe();
  }, [user, postId]);

  const handleLike = async () => {
    if (!user || !postId) {
      navigate('/auth');
      return;
    }

    const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
    const postRef = doc(db, 'posts', postId);

    try {
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          postId: postId,
          createdAt: new Date(),
        });
        await updateDoc(postRef, { likesCount: increment(1) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this verse?')) return;
    if (!postId) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-display italic text-primary/60"
      >
        Unfolding the scroll...
      </motion.div>
    </div>
  );
  
  if (!post) return null;

  const isAuthor = user?.uid === post.authorId;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="space-y-16 pb-32"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 rounded-full hover:bg-primary/5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {isAuthor && (
            <>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => navigate(`/edit/${post.id}`)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            // Could add a toast here
          }}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <article className="space-y-12 text-center relative">
        <header className="space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl poetry-title"
          >
            {post.title}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/60 uppercase tracking-[0.2em]">
              <Link to={`/profile/${post.authorId}`} className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
                <Avatar className="h-6 w-6 border border-primary/10">
                  <AvatarImage src={post.authorPhoto} alt={post.authorName} />
                  <AvatarFallback className="bg-primary/5 text-primary font-display text-[8px]">
                    {post.authorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {post.authorName}
              </Link>
              <span className="w-1 h-1 rounded-full bg-primary/20" />
              <span>{post.language}</span>
              <span className="w-1 h-1 rounded-full bg-primary/20" />
              <span>{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) + ' ago' : 'Just now'}</span>
            </div>
            <div className="w-12 h-px bg-primary/20" />
          </motion.div>
        </header>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="poetry-content max-w-xl mx-auto py-12 px-4 italic leading-loose text-foreground/90"
        >
          {post.content}
        </motion.div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col items-center gap-8 pt-16"
        >
          <div className="w-24 h-px bg-primary/10" />
          <div className="flex flex-col items-center gap-4">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="lg"
              className={cn(
                "rounded-full gap-3 px-10 h-14 transition-all duration-500",
                isLiked ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              )}
              onClick={handleLike}
            >
              <Heart className={`h-6 w-6 transition-transform duration-500 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-lg font-display">{post.likesCount || 0}</span>
            </Button>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.4em]">Appreciate the words</p>
          </div>
        </motion.footer>
      </article>
    </motion.div>
  );
};
