
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface ReferralStatsProps {
  userId: string;
}

const ReferralStats = ({ userId }: ReferralStatsProps) => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");

  // Fetch referral stats
  const { data: stats } = useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async () => {
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', userId);

      if (referralsError) throw referralsError;

      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const converted = referrals?.filter(r => r.status === 'converted').length || 0;

      return {
        totalReferrals: referrals?.length || 0,
        pendingReferrals: pending,
        convertedReferrals: converted
      };
    }
  });

  // Fetch user's referral code
  useEffect(() => {
    const fetchReferralCode = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
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
  }, [userId]);

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on RewardHub!',
          text: 'Use my referral link to sign up and earn points!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copying to clipboard
        copyToClipboard(referralLink, 'Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers that don't support sharing
      copyToClipboard(referralLink, 'Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 border rounded-md bg-muted"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink, 'Link copied!')}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={shareReferral}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Share this link with friends to earn points when they join!
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
              <h4 className="text-2xl font-bold">{stats?.totalReferrals || 0}</h4>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <UserPlus className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h4 className="text-2xl font-bold">{stats?.pendingReferrals || 0}</h4>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Converted</p>
              <h4 className="text-2xl font-bold">{stats?.convertedReferrals || 0}</h4>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReferralStats;
