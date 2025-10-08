import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  authorId: string;
}

export default function BlogEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEdit] = useState(!!id);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState(user.fullname)

  useEffect(() => {
    if (id && user) {
      fetchPost();
    } else if (!id && user) {
      setLoading(false);
    }
  }, [id, user]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/blogs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch post');
      }

      const data = await response.json();
      setPost(data.blog);

      // Set form fields
      setTitle(data.blog.title);
      setExcerpt(data.blog.excerpt);
      setContent(data.blog.content);
      setCategory(data.blog.category);
      setTags(data.blog.tags);
      setImageUrl(data.blog.imageUrl || '');

    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/blog" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !excerpt || !content || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `http://localhost:3000/api/blogs/${id}` : 'http://localhost:3000/api/blogs';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          authorName,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          imageUrl: imageUrl || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save post');

      toast.success(isEdit ? 'Blog post updated successfully' : 'Blog post created successfully');
      navigate('/blog');
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error && isEdit) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <div className="text-destructive text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Post</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/blog')}>Back to Articles</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="max-w-4xl mx-auto shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the blog post"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog content here"
                  rows={12}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Tips & Tricks"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., support, guide, tips"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Post' : 'Create Post'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}