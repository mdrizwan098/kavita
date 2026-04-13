import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';

export const Editor: React.FC = () => {
  const { postId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!postId);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            const data = postDoc.data();
            if (data.authorId !== user?.uid) {
              navigate('/');
              return;
            }
            setTitle(data.title);
            setContent(data.content);
            setLanguage(data.language);
          }
          setFetching(false);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `posts/${postId}`);
        }
      };
      fetchPost();
    }
  }, [postId, user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    if (!title || !content) return;

    setLoading(true);
    try {
      const postData = {
        title,
        content,
        language,
        authorId: user.uid,
        authorName: profile.username,
        authorPhoto: profile.photoURL || null,
        updatedAt: serverTimestamp(),
      };

      if (postId) {
        await updateDoc(doc(db, 'posts', postId), postData);
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: serverTimestamp(),
          likesCount: 0,
        });
      }
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, postId ? `posts/${postId}` : 'posts');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-display italic text-primary/60"
      >
        Preparing the parchment...
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-12 pb-32"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 rounded-full hover:bg-primary/5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={handleSave} disabled={loading} className="gap-2 rounded-full px-6 shadow-lg shadow-primary/10">
          <Save className="h-4 w-4" /> {loading ? 'Sealing...' : (postId ? 'Update' : 'Publish')}
        </Button>
      </div>

      <div className="sayar-card space-y-8 p-10">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium ml-1">Title of the Verse</label>
          <Input
            placeholder="A name for your thoughts..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-display italic border-none bg-transparent focus-visible:ring-0 p-0 h-auto placeholder:text-muted-foreground/20"
          />
          <div className="w-full h-px bg-primary/10" />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium ml-1">The Language of Soul</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full rounded-2xl border-primary/10 bg-background/50 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-primary/10">
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Urdu">Urdu</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium ml-1">Your Verses</label>
          <Textarea
            placeholder="Write your poetry here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="poetry-content min-h-[400px] border-none bg-transparent focus-visible:ring-0 p-0 resize-none placeholder:text-muted-foreground/20 leading-loose"
          />
        </div>
      </div>
    </motion.div>
  );
};
