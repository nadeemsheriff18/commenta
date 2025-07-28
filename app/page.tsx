"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, BotMessageSquare, Search, BarChart2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const faqData = [
    {
      question: "Is Commentta free?",
      answer: "Yes, we offer a free tier with limited features to get you started. You can monitor a certain number of keywords and subreddits to see the value for yourself before upgrading."
    },
    {
      question: "How does the AI generate comments?",
      answer: "Our AI uses the information you provide in your 'Knowledge Base' combined with the context of the Reddit conversation. It analyzes the post and existing comments to craft a reply that is relevant, helpful, and matches your specified tone."
    },
    {
      question: "Can I use this for multiple products?",
      answer: "Absolutely. Each 'Project' in Commentta can be configured for a different product, with its own unique Knowledge Base, keywords, and monitored subreddits."
    },
    {
      question: "Is it safe to connect my Reddit account?",
      answer: "Yes, we use Reddit's official and secure OAuth for authentication. We never store your password and only request the permissions necessary to post replies on your behalf."
    }
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Commentta</h1>
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>

          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
       {/* Hero Section */}
{/* --- MODIFIED: Adjusted padding to reduce top gap and increase side margins --- */}
<section className="container mx-auto px-8 pt-16 pb-24 sm:pt-20 sm:pb-32">
  <div className="grid lg:grid-cols-2 gap-12 items-center">
    
    {/* --- Column 1: Text Content --- */}
    <div className="text-center lg:text-left">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
        Talk to your customers daily — on Reddit.
        <br />
        <span className="block mt-2">That's your real job as a founder.</span>
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        We catch Reddit leads every day, write your perfect reply, and you post it - all in under a minute.
      </p>
      <div className="mt-10 flex items-center justify-center lg:justify-start gap-x-4">
        <Button size="lg" className="bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Start Now</Button>
        <Button size="lg" variant="outline" onClick={() => {/* Add demo link */ }}>
          Watch Demo
        </Button>
      </div>
      <p className="mt-4 text-xs text-gray-500">No credit card required</p>
    </div>

    {/* --- Column 2: Image --- */}
    <div className="bg-gray-100 h-96 rounded-lg shadow-lg flex items-center justify-center">
      <p className="text-gray-400">[Product Dashboard Screenshot]</p>
    </div>

  </div>
</section>

        {/* Social Proof / Testimonials */}
        <section id="social-proof" className="bg-slate-50 py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                People Are Already Winning With This Approach
              </h2>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader><CardTitle className="text-lg">Engagement and Relationship Building</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700 italic">"I've got so many exciting leads to share with you all about how I managed to get 10+ alerts for my SaaS startup just past week, leading to some great conversations."</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">$5,000+ Purchase Influenced by Reddit</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700 italic">"Real buyers, real discussions. Right in the comments. We closed a major deal that started from a single, helpful reply on Reddit."</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">They Signed at the Right Time</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700 italic">"With Commentta, you'll never miss that conversation again. We found a customer who was actively looking for a solution just like ours."</p></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-24 sm:py-32 space-y-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              See How Commentta Finds Leads & Writes Replies
            </h2>
          </div>
          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-100 h-80 rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-400">[App Screenshot: Scanning]</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Commentta scans Reddit 24/7 to find people looking for what you offer</h3>
              <p className="mt-4 text-gray-600">Our system identifies purchase-intent keywords in relevant communities, surfacing hot leads before they go cold.</p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Real-time leads from Reddit's most active communities.</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Focus on discussions, not just keywords, to find real potential customers.</span></li>
              </ul>
            </div>
          </div>
          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-last bg-gray-100 h-80 rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-400">[App Screenshot: Replying]</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Commentta Crafts Replies That Sell — Without the Sales Pitch</h3>
              <p className="mt-4 text-gray-600">The AI understands the user's needs and writes helpful, context-aware replies based on your unique knowledge base.</p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Smart, Context-Aware Replies that sound human.</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Save hours of time trying to write the perfect response.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-slate-50 py-24 sm:py-32">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
              {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Pricing Section */}
<section id="pricing" className="bg-slate-50 py-24 sm:py-32">
  <div className="container mx-auto px-6">
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Pricing</h2>
      <p className="mt-4 text-lg text-gray-600">Choose a plan that works for you.</p>
    </div>

    {/* --- MODIFIED: Added shadows, hover effects, feature lists, and a "Most Popular" badge --- */}
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Founder Plan */}
      <Card className="flex flex-col shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <CardHeader>
          <CardTitle>Founder</CardTitle>
          <CardDescription>For individuals and early-stage startups.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <p className="text-4xl font-bold">$29<span className="text-xl font-normal text-gray-500">/mo</span></p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>1 Project</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>10 Keywords</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>25 Subreddits</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Email Support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleGetStarted}>Get Started</Button>
        </CardFooter>
      </Card>

      {/* Startup Plan (Most Popular) */}
      <Card className="flex flex-col shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-green-700 relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-700 text-white text-sm font-semibold rounded-full">
          Most Popular
        </div>
        <CardHeader className="pt-8">
          <CardTitle>Startup</CardTitle>
          <CardDescription>For growing teams that need more power.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <p className="text-4xl font-bold">$99<span className="text-xl font-normal text-gray-500">/mo</span></p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>5 Projects</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>50 Keywords</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>200 Subreddits</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Priority Support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Get Started</Button>
        </CardFooter>
      </Card>

      {/* Enterprise Plan */}
      <Card className="flex flex-col shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>For large organizations and agencies.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-6">
          <p className="text-4xl font-bold">Contact Us</p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Unlimited Projects</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Unlimited Keywords</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Custom Integrations</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Dedicated Account Manager</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Contact Sales</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Commentta. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-gray-800">Twitter</Link>
            <Link href="#" className="hover:text-gray-800">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}