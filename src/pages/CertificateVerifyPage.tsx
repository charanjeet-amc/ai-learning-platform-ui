import { useParams } from 'react-router-dom';
import { useVerifyCertificateQuery } from '@/store/api/certificateApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  CheckCircle2,
  Download,
  Link2,
  Linkedin,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function CertificateVerifyPage() {
  const { verificationCode } = useParams<{ verificationCode: string }>();
  const { data: cert, isLoading, isError } = useVerifyCertificateQuery(verificationCode!);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.open(
      `${API_BASE}/api/public/certificates/${verificationCode}/download`,
      '_blank'
    );
  };

  const handleLinkedIn = () => {
    if (!cert) return;
    const params = new URLSearchParams({
      mini: 'true',
      url: window.location.href,
      title: `Certificate of Completion: ${cert.courseTitle}`,
      summary: `I completed "${cert.courseTitle}" on AI Learning Platform!`,
    });
    window.open(`https://www.linkedin.com/shareArticle?${params.toString()}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-indigo-900">
        <div className="animate-pulse text-white text-lg">Verifying certificate...</div>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-indigo-900 p-4">
        <Card className="max-w-md w-full bg-white/5 border-white/10 text-white">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold">Certificate Not Found</h1>
            <p className="text-indigo-300">
              This certificate code is invalid or has been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Verified badge */}
        <div className="flex items-center justify-center gap-2 text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Verified Certificate</span>
        </div>

        {/* Certificate card */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-500/60 shadow-2xl shadow-indigo-900/50">
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] px-10 py-14 text-center space-y-6">
            {/* Inner border decoration */}
            <div className="absolute inset-3 rounded-xl border border-yellow-500/30 pointer-events-none" />

            <p className="text-yellow-400 text-sm font-semibold tracking-[0.2em] uppercase">
              AI Learning Platform
            </p>

            <div className="space-y-1">
              <Award className="h-12 w-12 text-yellow-400 mx-auto" />
              <h1 className="text-3xl font-bold text-white mt-3">Certificate of Completion</h1>
            </div>

            <p className="text-indigo-300 italic">This certifies that</p>

            <div>
              <p className="text-4xl font-bold text-yellow-400">{cert.userName}</p>
              <div className="h-px bg-yellow-500/40 w-64 mx-auto mt-2" />
            </div>

            <p className="text-indigo-300 italic">has successfully completed</p>

            <p className="text-2xl font-bold text-white">{cert.courseTitle}</p>

            <div className="pt-4 border-t border-white/10 flex justify-between text-sm text-indigo-400">
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider mb-1">Date of Issue</p>
                <p className="text-white font-medium">{issuedDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-white font-mono text-xs">{cert.verificationCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleDownload}
            className="bg-yellow-500 hover:bg-yellow-400 text-indigo-950 font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {copied ? 'Link Copied!' : 'Copy Link'}
          </Button>
          <Button
            variant="outline"
            onClick={handleLinkedIn}
            className="border-[#0077b5]/50 text-[#0077b5] hover:bg-[#0077b5]/10"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Share on LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
}
