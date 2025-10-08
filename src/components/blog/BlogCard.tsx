import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  authorName: string;
  createdAt: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={`/blog/${post.id}`}>
      <Card className="overflow-hidden hover:shadow-card transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
        {post.imageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="line-clamp-2">{post.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}