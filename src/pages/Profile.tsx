
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
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
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

  // Fetch user's referral code
  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching referral code:', error);
        return;
      }

      if (data?.referral_code) {
        setReferralCode(data.referral_code);
        setReferralLink(`${window.location.origin}/register?ref=${data.referral_code}`);
      }
    };

    fetchReferralCode();
  }, [session?.user?.id]);

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

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
    <div className="container max-w-3xl py-10 space-y-6">
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

      {session?.user?.id && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Referral Link</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(referralLink, 'Link copied!')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
