import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyApplicationQuery,
  useSubmitApplicationMutation,
} from '@/store/api/instructorApplicationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Send,
} from 'lucide-react';

export default function InstructorApplyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, roles } = useAppSelector((s) => s.auth);
  const isPending = roles.includes('PENDING_INSTRUCTOR');
  const isInstructor = roles.includes('INSTRUCTOR');

  const { data: existingApp, isLoading: appLoading } = useGetMyApplicationQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [submitApplication, { isLoading: submitting }] = useSubmitApplicationMutation();

  // Form state
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [yearsTeaching, setYearsTeaching] = useState('');
  const [currentInstitution, setCurrentInstitution] = useState('');
  const [teachingDescription, setTeachingDescription] = useState('');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState('');
  const [otherPlatforms, setOtherPlatforms] = useState('');
  const [expertise, setExpertise] = useState('');
  const [whyTeach, setWhyTeach] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Sign in Required</h2>
        <p className="text-muted-foreground mb-6">Please register as an instructor first</p>
        <Button onClick={() => navigate('/instructor/register')}>Register as Instructor</Button>
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="container py-16 text-center">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold mb-2">You're an Approved Instructor!</h2>
        <p className="text-muted-foreground mb-6">You can create and manage courses from the Instructor Studio.</p>
        <Button onClick={() => navigate('/instructor')}>Go to Instructor Studio</Button>
      </div>
    );
  }

  if (!isPending) {
    return (
      <div className="container py-16 text-center">
        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Want to Teach?</h2>
        <p className="text-muted-foreground mb-6">Register as an instructor to get started.</p>
        <Button onClick={() => navigate('/instructor/register')}>Register as Instructor</Button>
      </div>
    );
  }

  if (appLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already submitted — show status
  if (existingApp || submitted) {
    const app = existingApp;
    const status = app?.status ?? 'PENDING';
    return (
      <div className="container py-12 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-8 text-center">
            {status === 'PENDING' && (
              <>
                <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
                <p className="text-muted-foreground mb-4">
                  Your instructor application has been submitted and is being reviewed by our team.
                  You'll be notified once a decision is made.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Pending Review
                </div>
              </>
            )}
            {status === 'APPROVED' && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2">Application Approved!</h2>
                <p className="text-muted-foreground mb-6">
                  Congratulations! You are now an approved instructor. You can start creating courses.
                </p>
                <Button onClick={() => navigate('/instructor')}>Go to Instructor Studio</Button>
              </>
            )}
            {status === 'REJECTED' && (
              <>
                <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold mb-2">Application Not Approved</h2>
                <p className="text-muted-foreground mb-4">
                  Unfortunately, your application was not approved at this time.
                </p>
                {app?.adminNotes && (
                  <div className="text-left bg-muted p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium mb-1">Reviewer Notes:</p>
                    <p className="text-sm text-muted-foreground">{app.adminNotes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!expertise.trim() || !whyTeach.trim()) {
      setError('Please fill in your expertise and motivation to teach.');
      return;
    }

    try {
      await submitApplication({
        headline: headline || undefined,
        photoUrl: photoUrl || undefined,
        bio: bio || undefined,
        cvUrl: cvUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        yearsTeaching: yearsTeaching ? parseInt(yearsTeaching) : undefined,
        currentInstitution: currentInstitution || undefined,
        teachingDescription: teachingDescription || undefined,
        youtubeChannelUrl: youtubeChannelUrl || undefined,
        youtubeSubscribers: youtubeSubscribers ? parseInt(youtubeSubscribers) : undefined,
        otherPlatforms: otherPlatforms || undefined,
        expertise: expertise || undefined,
        whyTeach: whyTeach || undefined,
      }).unwrap();
      setSubmitted(true);
    } catch {
      setError('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Instructor Profile</h1>
        <p className="text-muted-foreground mt-1">
          Tell us about your teaching experience and expertise. This helps us review your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Professional Headline</label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior ML Engineer at Google | PhD in Computer Science"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself, your background, and your passion for teaching..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Profile Photo URL</label>
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CV / Resume URL</label>
              <Input
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="Link to your CV (Google Drive, Dropbox, etc.)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social & Professional Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Personal Website</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teaching Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teaching Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Years of Teaching Experience</label>
                <Input
                  type="number"
                  min="0"
                  value={yearsTeaching}
                  onChange={(e) => setYearsTeaching(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Institution / Company</label>
                <Input
                  value={currentInstitution}
                  onChange={(e) => setCurrentInstitution(e.target.value)}
                  placeholder="e.g. Stanford University, Google, Freelance"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Describe Your Teaching Experience *</label>
              <textarea
                value={teachingDescription}
                onChange={(e) => setTeachingDescription(e.target.value)}
                placeholder="What courses have you taught? What's your teaching style? Any certifications?"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Online Presence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Online Presence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">YouTube Channel URL</label>
                <Input
                  value={youtubeChannelUrl}
                  onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/c/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">YouTube Subscribers</label>
                <Input
                  type="number"
                  min="0"
                  value={youtubeSubscribers}
                  onChange={(e) => setYoutubeSubscribers(e.target.value)}
                  placeholder="e.g. 10000"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Other Teaching Platforms</label>
              <textarea
                value={otherPlatforms}
                onChange={(e) => setOtherPlatforms(e.target.value)}
                placeholder="e.g. Udemy (50k students), Coursera partner, Blog with 100k monthly readers..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Expertise & Motivation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expertise & Motivation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Areas of Expertise *</label>
              <textarea
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. Machine Learning, Deep Learning, NLP, Python, Data Science, Computer Vision..."
                rows={2}
                required
                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Why Do You Want to Teach on AILearn? *</label>
              <textarea
                value={whyTeach}
                onChange={(e) => setWhyTeach(e.target.value)}
                placeholder="What motivates you to create courses on our platform? What kind of courses would you create?"
                rows={3}
                required
                className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit Application for Review
        </Button>
      </form>
    </div>
  );
}
