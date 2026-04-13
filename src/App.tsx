import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Editor } from './pages/Editor';
import { Profile } from './pages/Profile';
import { PostDetail } from './pages/PostDetail';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/write" element={<Editor />} />
            <Route path="/edit/:postId" element={<Editor />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post/:postId" element={<PostDetail />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
