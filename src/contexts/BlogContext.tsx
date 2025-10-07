import { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost } from '@/types';
import { mockBlogPosts } from '@/lib/mockData';

interface BlogContextType {
  posts: BlogPost[];
  createPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePost: (id: string, updates: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  getPostById: (id: string) => BlogPost | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);

  const createPost = (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPost: BlogPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPosts([...posts, newPost]);
  };

  const updatePost = (id: string, updates: Partial<BlogPost>) => {
    setPosts(posts.map(post => 
      post.id === id 
        ? { ...post, ...updates, updatedAt: new Date() }
        : post
    ));
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  const getPostById = (id: string) => posts.find(p => p.id === id);

  return (
    <BlogContext.Provider value={{
      posts,
      createPost,
      updatePost,
      deletePost,
      getPostById,
    }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}
