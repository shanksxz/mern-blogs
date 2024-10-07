import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Tiptap from "@/components/TipTap";
import { useForm } from "react-hook-form";

function stripHtmlAndTruncate(content, length = 100) {
  const plainText = content.replace(/<\/?[^>]+(>|$)/g, "");
  return plainText.length > length
    ? plainText.substring(0, length) + "..."
    : plainText;
}

export default function Component() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/posts`,
          {
            withCredentials: true,
          },
        );
        setPosts(res.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error.response);
      }
    };

    fetchPosts();
  }, []);

  const openDeleteDialog = (postId) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setPostToEdit(post);
    setValue("title", post.title);
    setValue("content", post.content);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/post/${postToDelete}`,
        {
          withCredentials: true,
        },
      );
      toast.success("Post deleted successfully");
      setPosts(posts.filter((post) => post._id !== postToDelete));
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      toast.error("Error deleting post");
      console.error("Error deleting post:", error.response);
    }
  };

  const handleEdit = async (data) => {
    if (!postToEdit) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/post/${postToEdit._id}`,
        {
          title: data.title,
          content: data.content,
        },
        {
          withCredentials: true,
        },
      );
      toast.success("Post updated successfully");
      setPosts(
        posts.map((post) =>
          post._id === postToEdit._id
            ? { ...post, title: data.title, content: data.content }
            : post,
        ),
      );
      setIsEditDialogOpen(false);
      setPostToEdit(null);
    } catch (error) {
      toast.error("Error updating post");
      console.error("Error updating post:", error.response);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <header className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">My Blog Posts</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Input
              className="w-full sm:max-w-sm"
              placeholder="Search blog posts..."
              type="search"
            />
            <Button onClick={() => navigate("/create/post")} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>
        </header>
        <main>
          <div className="grid gap-4 md:gap-6">
            {posts.map((post) => (
              <Card key={post._id}>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-gray-500 mb-1 -mt-3">
                    Published on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    {stripHtmlAndTruncate(post.content)}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(post)}
                      className="flex-1 sm:flex-none"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDeleteDialog(post._id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                  <Link to={`/post/${post._id}`} className="w-full sm:w-auto">
                    <Button variant="link" className="w-full sm:w-auto">Read More</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this post?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] md:h-[80vh] flex flex-col">
          <form
            onSubmit={handleSubmit(handleEdit)}
            className="flex flex-col h-full"
          >
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Make changes to your post here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 px-2 flex-grow overflow-hidden">
              <div className="grid items-start gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      {...field}
                      placeholder="Enter post title"
                      className="col-span-3"
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Tiptap
                      content={field.value}
                      onChange={field.onChange}
                      className="h-[40vh] md:h-[50vh] w-full"
                    />
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button type="submit" className="mt-2 sm:mt-0">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
