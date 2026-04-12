import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Brain,
  Sparkles,
  Target,
  Trophy,
  Zap,
  ArrowRight,
  BookOpen,
  Bot,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Knowledge Graph Architecture',
    description: 'Courses structured as interconnected concept graphs, not linear playlists. Every concept has prerequisites, outcomes, and adaptive paths.',
  },
  {
    icon: Bot,
    title: 'Socratic AI Tutor',
    description: 'GPT-4o powered tutor that guides through questions instead of giving answers. Adapts hint levels based on your understanding.',
  },
  {
    icon: Target,
    title: 'Mastery-Based Learning',
    description: 'Advanced mastery scoring with M = 0.4S + 0.2C + 0.2R + 0.2T formula. Progress only when you truly understand.',
  },
  {
    icon: Zap,
    title: 'Adaptive Engine',
    description: 'AI that detects when you\'re struggling and dynamically adjusts difficulty, prerequisites, and learning paths in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Visual dashboards showing mastery levels, weak areas, learning velocity, and personalized improvement suggestions.',
  },
  {
    icon: Trophy,
    title: 'Gamification System',
    description: 'XP, badges, streaks, leaderboards, and milestone rewards that make learning addictive and rewarding.',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3 inline mr-1" />
                GPT-4o Powered
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Learn Smarter with{' '}
              <span className="text-primary">AI-Powered</span>{' '}
              Socratic Learning
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              The world&apos;s most advanced learning platform. Knowledge graph architecture, 
              adaptive mastery-based progression, and an AI tutor that teaches through discovery 
              — not memorization.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link to="/courses">
                <Button size="lg" className="text-base">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explore Courses
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-base">
                  My Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Beyond Traditional E-Learning</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Built from the ground up with AI-native architecture that adapts to how you learn.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to transform how you learn?</h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of learners using AI-powered Socratic methodology to achieve deep understanding.
          </p>
          <Link to="/courses">
            <Button size="lg" className="mt-6">
              Get Started Free <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
