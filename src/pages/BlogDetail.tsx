import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Calendar, User, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { mockUsers } from '@/lib/mockData';
import { toast } from 'sonner';

export default function BlogDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getPostById, deletePost } = useBlog();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const post = getPostById(id!);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const author = mockUsers.find(u => u.id === post.authorId);
  const canEdit = user.role === 'admin';

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this article?')) {
      deletePost(post.id);
      toast.success('Article deleted successfully');
      navigate('/blog');
    }
  };

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
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <Avatar>
                  <AvatarImage src={author?.avatar} />
                  <AvatarFallback>{author?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{author?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(post.createdAt, 'MMMM d, yyyy')}</span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
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
