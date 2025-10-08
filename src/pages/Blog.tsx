import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { BlogCard } from "@/components/blog/BlogCard";
import { Search, Plus } from "lucide-react";

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

export default function Blog() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/blogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch posts");
      }

      const data = await response.json();

      // Transform each blog post: convert tags string → tags array
      const blogs = data.blogs.map((blog) => {
        // Safely split tags if they exist and are a string
        const tagsArray =
          blog.tags && typeof blog.tags === "string"
            ? blog.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag !== "")
            : [];

        return {
          ...blog,
          tags: tagsArray,
        };
      });

      setPosts(blogs || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || post.category === selectedCategory;
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full inline-block mb-4">
            <div className="text-destructive text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Articles</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchPosts}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground">
              {filteredPosts.length} article
              {filteredPosts.length !== 1 ? "s" : ""} found
            </p>
          </div>
          {user.role === "admin" && (
            <Button asChild>
              <Link to="/blog/create">
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              Categories:
            </span>
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Tags:</span>
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              All
            </Badge>
            {allTags.slice(0, 10).map((tag, index) => (
              <Badge
                key={index}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No articles match your filters
            </p>
            {(search || selectedCategory || selectedTag) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                  setSelectedTag(null);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
