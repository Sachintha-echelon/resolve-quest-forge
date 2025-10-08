import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { UserRole } from '@/types';
import { Users, Shield, Headphones, User, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const roleIcons = {
  admin: Shield,
  agent: Headphones,
  customer: User,
};

const roleColors = {
  admin: 'bg-destructive text-destructive-foreground',
  agent: 'bg-primary text-primary-foreground',
  customer: 'bg-secondary text-secondary-foreground',
};

export default function UserManagement() {
  const { user, users, updateUser, deleteUser, createUser, fetchAllUsers } = useAuth();
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    role: '' as UserRole
  });
  const [createForm, setCreateForm] = useState({
    fullname: '',
    email: '',
    password: '',
    bio: '',
    role: 'customer' as UserRole
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [user, fetchAllUsers]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const usersByRole = users.reduce((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {} as Record<UserRole, typeof users>);

  const handleEditClick = (u: typeof users[0]) => {
    setEditingUser(u);
    setEditForm({
      name: u.fullname,
      email: u.email,
      bio: u.bio || '',
      role: u.role
    });
  };

  const handleEditSave = () => {
    if (editingUser) {
      updateUser(editingUser.id, {
        fullname: editForm.name,
        email: editForm.email,
        bio: editForm.bio,
        role: editForm.role
      });
      toast.success('User updated successfully');
      setEditingUser(null);
    }
  };

  const handleDelete = () => {
    if (deletingUserId) {
      deleteUser(deletingUserId);
      toast.success('User deleted successfully');
      setDeletingUserId(null);
    }
  };

  const handleCreateUser = () => {
    createUser({
      fullname: createForm.fullname,
      email: createForm.email,
      password: createForm.password,
      bio: createForm.bio,
      role: createForm.role,
      avatarUrl: ''
    });
    toast.success('User created successfully');
    setIsCreateDialogOpen(false);
    setCreateForm({
      fullname: '',
      email: '',
      password: '',
      bio: '',
      role: 'customer'
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {usersByRole.agent?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Support Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {usersByRole.customer?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u) => {
                const Icon = roleIcons[u.role];
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={u.avatarUrl} />
                        <AvatarFallback>{u.fullname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{u.fullname}</h3>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        {u.bio && (
                          <p className="text-xs text-muted-foreground mt-1">{u.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[u.role]}>
                        <Icon className="w-3 h-3 mr-1" />
                        {u.role.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(u)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingUserId(u.id)}
                        disabled={u.id === user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Support Agent</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                value={createForm.fullname}
                onChange={(e) => setCreateForm({ ...createForm, fullname: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={createForm.bio}
                onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Support Agent</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}