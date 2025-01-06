import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  try {
    // Get all users and their last activity
    const { data: users, error: usersError } = await supabase
      .from('user_activity_log')
      .select(`
        user_id,
        last_active_at,
        profiles (
          email
        )
      `);

    if (usersError) throw usersError;

    // Get active prizes for motivation
    const { data: prizes, error: prizesError } = await supabase
      .from('prizes')
      .select('*')
      .eq('active', true)
      .limit(3);

    if (prizesError) throw prizesError;

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Process each user
    for (const user of users) {
      const lastActive = new Date(user.last_active_at);
      const email = user.profiles?.email;
      
      if (!email) continue;

      let emailContent = '';
      let subject = '';

      if (lastActive <= sevenDaysAgo) {
        subject = "We miss you at RewardHub! 🤔";
        emailContent = `
          <p>Hi there!</p>
          <p>We noticed you haven't been active on RewardHub for a week. Is everything okay?</p>
          <p>We'd love to see you back! Here are some exciting prizes you could win:</p>
        `;
      } else if (lastActive <= threeDaysAgo) {
        subject = "Quick Reminder from RewardHub! 👋";
        emailContent = `
          <p>Hi there!</p>
          <p>Just a friendly reminder that RewardHub misses your engagement!</p>
          <p>Check out these amazing prizes you could win:</p>
        `;
      } else {
        continue; // Skip if user has been active recently
      }

      // Add prizes to email content
      if (prizes.length > 0) {
        emailContent += '<ul>';
        prizes.forEach(prize => {
          emailContent += `
            <li>
              <strong>${prize.name}</strong> - ${prize.description}
              (${prize.points_required} points needed)
            </li>
          `;
        });
        emailContent += '</ul>';
      }

      emailContent += `
        <p>Keep networking and participating in events to earn points!</p>
        <p>Best regards,<br>The RewardHub Team</p>
      `;

      // Send email using Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'RewardHub <onboarding@resend.dev>',
          to: [email],
          subject: subject,
          html: emailContent,
        }),
      });

      console.log(`Reminder email sent to ${email}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-engagement-reminders function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});