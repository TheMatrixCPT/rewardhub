import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileImage } from "@/components/profile/ProfileImage";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { ContactInfo } from "@/components/profile/ContactInfo";
import { ProfessionalInfo } from "@/components/profile/ProfessionalInfo";
import { ProfileActions } from "@/components/profile/ProfileActions";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: "",
    linkedin_profile: "",
    company: "",
    job_title: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    referral_source: "",
  });

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Update profile state when userProfile data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfile(prev => ({
        ...prev,
        ...userProfile,
      }));
    }
  }, [userProfile]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session?.user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', session?.user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfileImage
              avatarUrl={profile.avatar_url}
              isEditing={isEditing}
              uploadingImage={uploadingImage}
              onImageUpload={handleImageUpload}
            />
            
            <PersonalInfo
              profile={profile}
              isEditing={isEditing}
              onChange={handleProfileChange}
            />
            
            <ContactInfo
              profile={profile}
              isEditing={isEditing}
              onChange={handleProfileChange}
            />
            
            <ProfessionalInfo
              profile={profile}
              isEditing={isEditing}
              onChange={handleProfileChange}
            />
            
            <ProfileActions
              isEditing={isEditing}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
