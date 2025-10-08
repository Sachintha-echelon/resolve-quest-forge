/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Briefcase } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    bio: '',
    avatarUrl: '',
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname,
        email: user.email,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only send fields that have changed
    const updates: any = {};
    if (formData.fullname !== user.fullname) updates.fullname = formData.fullname;
    if (formData.email !== user.email) updates.email = formData.email;
    if (formData.bio !== (user.bio || '')) updates.bio = formData.bio;
    if (formData.avatarUrl !== (user.avatarUrl || '')) updates.avatarUrl = formData.avatarUrl;

    updateProfile(updates);
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullname: user.fullname,
      email: user.email,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {formData.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="flex-1">
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input
                        id="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullname"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="font-medium capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}