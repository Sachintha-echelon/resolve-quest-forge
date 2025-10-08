import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Calendar, User, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchPost();
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

      const tags = data.blog.tags.split(',')

      const blog = data.blog;
      blog.tags = tags;
      setPost(data.blog);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/blogs/${post.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete post');
        }

        toast.success('Article deleted successfully');
        navigate('/blog');
      } catch (err) {
        console.error('Error deleting post:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to delete article');
      }
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <div className="text-destructive text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Article Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || 'The requested article does not exist'}</p>
          <Button onClick={() => navigate('/blog')}>Back to Articles</Button>
        </div>
      </div>
    );
  }

  const canEdit = user.role === 'admin';

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          {post.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-8 shadow-card">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card className="shadow-card mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{post.authorName.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{post.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/blog/edit/${post.id}`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
                <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}