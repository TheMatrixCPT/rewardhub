
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminAnnouncements = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [type, setType] = useState("general");
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, profiles(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        youtube_url: youtubeUrl || null,
        type,
        created_by: userData.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setIsOpen(false);
      setTitle("");
      setContent("");
      setYoutubeUrl("");
      setType("general");
      toast.success("Announcement created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create announcement");
      console.error("Error creating announcement:", error);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for all users
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="guidelines">Guidelines</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter announcement content"
                  rows={4}
                />
              </div>
              {type === "video" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    YouTube URL
                  </label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube video URL"
                  />
                </div>
              )}
              <Button
                className="w-full"
                onClick={() => createAnnouncement.mutate()}
                disabled={!title || !content}
              >
                Create Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {announcements?.map((announcement) => (
          <div
            key={announcement.id}
            className="border rounded-lg p-4 space-y-2 bg-card"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{announcement.title}</h3>
              <span className="text-xs text-muted-foreground">
                {new Date(announcement.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{announcement.content}</p>
            {announcement.youtube_url && (
              <a
                href={announcement.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Watch Video
              </a>
            )}
            <div className="text-xs text-muted-foreground">
              Posted by: {announcement.profiles?.first_name}{" "}
              {announcement.profiles?.last_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
