"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
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
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => { router.push('/login'); };
  const handleSignIn = () => { router.push('/login'); };

  const faqData = [
  {
    question: "What is Commentta?",
    answer: "Commentta is a tool that helps you find and engage with potential customers on Reddit. It scans for conversations related to your product and uses AI to help you write helpful, authentic replies."
  },
  {
    question: "How do I use Commentta?",
    answer: "Start by creating a project and adding details to your Knowledge Base. Then, add keywords and subreddits you want to monitor. Commentta will find relevant mentions in your dashboard, where you can use AI to generate replies."
  },
  {
    question: "Who is Commentta for?",
    answer: "Commentta is designed for SaaS founders, indie hackers, and marketers who want to engage directly with potential customers and build a community on Reddit without running paid ads."
  },
  {
    question: "Is it safe to connect my Reddit account?",
    answer: "Yes. Commentta uses Reddit's official and secure OAuth for authentication. We never see or store your Reddit password, and only request the minimum permissions needed to post replies on your behalf."
  }
];

  return (
    <div className="bg-slate-100 text-gray-800">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
             <img src="/logo.jpg" className="w-8 h-8 rounded-lg"/>
            <h1 className="text-xl font-bold text-gray-900">Commentta</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSignIn}>Sign In</Button>
            <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Talk to your customers daily on Reddit.
                <br />
                <span className="block mt-1 text-green-700">That's your real job as a founder.</span>
              </h1>
              <p className="mt-4 text-md md:text-lg text-gray-600">
                We catch Reddit leads every day, write your perfect reply, and you post it - all in under a minute.
              </p>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-4">
                <Button size="lg" className="bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Start Now</Button>
                <Button size="lg" variant="outline" onClick={() => {}}>Watch Demo</Button>
              </div>
            </div>
            <div className="bg-gray-100 h-80 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">[Product Dashboard Screenshot]</p>
            </div>
          </div>
        </section>

        <section id="social-proof" className="py-24 sm:py-32">
  <div className="container mx-auto px-6">
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        People Are Already Winning With This Approach
      </h2>
    </div>
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg font-semibold">"$5,000+ purchase influenced by Reddit."</CardTitle>
            <CardDescription>Real buyers. Real decisions. Right in the comments.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-gray-700 border-l-2 border-green-700 pl-4 italic">"By this point you HAVE to purposefully provide a bad experience for me to look for an alternative. Reddit + Google search results + Community review = WIN"</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg font-semibold">Engagement and Relationship Building</CardTitle>
            <CardDescription>From $0 to $79,342 MRR using Reddit</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-gray-700 border-l-2 border-green-700 pl-4 italic">"I've got an exciting story to share... how I managed to get 50+ clients for my SaaS startup in just 6 months, all thanks to Reddit! I didn't just see Reddit as a lead generation tool; I saw it as an opportunity to build genuine relationships."</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg font-semibold">It's about conversations that convert</CardTitle>
            <CardDescription>Shimmer made $280K from Reddit in one year.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-gray-700 border-l-2 border-green-700 pl-4 italic">"No ads. Just real replies, real people, real trust. They simply monitored high-intent posts, engaged authentically, and built trust. The result? 4x lower CAC and their #1 source of new leads. You can do it too."</p>
        </CardContent>
      </Card>
    </div>
  </div>
</section>
        
        <section id="demo" className="py-16 sm:py-24">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Watch this quick demo to see how Commentta works.
                </h2>
                <div className="mt-10 max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gray-200 aspect-video flex items-center justify-center">
                        <p className="text-gray-500">[Project Demo Video]</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">See How Commentta Finds Leads & Writes Replies</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-2 rounded-lg shadow-2xl">
                <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">
                    <p className="text-gray-400 text-sm">[App Screenshot: Scanning]</p>
                </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Commentta scans Reddit 24/7</h3>
              <p className="mt-2 text-gray-600">We surface the right posts, rank them by priority, and generate replies that sound like you.</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Real-time leads from Reddit</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Priority scoring for every post</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Never miss a potential customer</span></li>
              </ul>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-last bg-white p-2 rounded-lg shadow-2xl">
                <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">
                    <p className="text-gray-400 text-sm">[App Screenshot: Replying]</p>
                </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Commentta Crafts Replies That Sell without sounding like a pitch</h3>
              <p className="mt-2 text-gray-600">We read the thread, understand the user, and write a response that fits naturally.</p>
               <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Smart, Context-Aware Replies</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Product Mentions That Don't Feel Forced</span></li>
              </ul>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-2 rounded-lg shadow-2xl">
                <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">
                    <p className="text-gray-400 text-sm">[App Screenshot: Scanning]</p>
                </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">We alert you by email. You post the reply.</h3>
              <p className="mt-2 text-gray-600">Consistency turns comments into customers.</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Real-time leads from Reddit</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Priority scoring for every post</span></li>
                <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Never miss a potential customer</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 sm:py-32">
  <div className="container mx-auto px-6 max-w-3xl">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Frequently Asked Questions
      </h2>
    </div>
    <Accordion type="single" collapsible className="w-full mt-12">
      {faqData.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-lg text-left hover:text-green-700">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-base text-gray-600">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
</section>
        
        <section id="pricing" className="py-16 sm:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pricing</h2>
                    <p className="mt-2 text-md text-gray-600">Choose a plan that works for you.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card className="flex flex-col shadow-md">
                        <CardHeader><CardTitle className="text-lg">Free</CardTitle><CardDescription className="text-sm">Access Basic AI detection.</CardDescription></CardHeader>
                        <CardContent className="flex-grow space-y-4"><p className="text-3xl font-bold">$0.00<span className="text-lg font-normal text-gray-500">/mo</span></p><ul className="space-y-2 text-xs text-gray-600"><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Basic AI Scan</li><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>5 Free Advanced Scans</li></ul></CardContent>
                        <CardFooter><Button variant="secondary" className="w-full" disabled>Current Plan</Button></CardFooter>
                    </Card>
                    <Card className="flex flex-col shadow-md">
                        <CardHeader><CardTitle className="text-lg">Essential</CardTitle><CardDescription className="text-sm">More words for basic AI detection.</CardDescription></CardHeader>
                        <CardContent className="flex-grow space-y-4"><p className="text-3xl font-bold">$8.33<span className="text-lg font-normal text-gray-500">/mo</span></p><ul className="space-y-2 text-xs text-gray-600"><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Basic AI Scan</li><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Grammar Check</li></ul></CardContent>
                        <CardFooter><Button variant="outline" className="w-full" onClick={handleGetStarted}>Choose Plan</Button></CardFooter>
                    </Card>
                    <Card className="flex flex-col shadow-md border-2 border-green-700 relative">
                        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center"><div className="px-3 py-1 bg-green-700 text-white text-xs font-semibold rounded-full">MOST POPULAR</div></div>
                        <CardHeader className="pt-8"><CardTitle className="text-lg">Premium</CardTitle><CardDescription className="text-sm">Access all of our premium features.</CardDescription></CardHeader>
                        <CardContent className="flex-grow space-y-4"><p className="text-3xl font-bold">$12.99<span className="text-lg font-normal text-gray-500">/mo</span></p><ul className="space-y-2 text-xs text-gray-600"><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>All of Essential</li><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Advanced Scan</li><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Writing Feedback</li></ul></CardContent>
                        <CardFooter><Button className="w-full bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Choose Plan</Button></CardFooter>
                    </Card>
                    <Card className="flex flex-col shadow-md">
                        <CardHeader><CardTitle className="text-lg">Professional</CardTitle><CardDescription className="text-sm">For teams and enterprises.</CardDescription></CardHeader>
                        <CardContent className="flex-grow space-y-4"><p className="text-3xl font-bold">$24.99<span className="text-lg font-normal text-gray-500">/mo</span></p><ul className="space-y-2 text-xs text-gray-600"><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>All of Premium</li><li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600"/>Teams Collaboration</li></ul></CardContent>
                        <CardFooter><Button variant="outline" className="w-full">Choose Plan</Button></CardFooter>
                    </Card>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-6 py-8 flex justify-between items-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Commentta. All rights reserved.</p>
            <div className="flex space-x-4">
                <Link href="#" className="hover:text-gray-800">Twitter</Link>
                <Link href="#" className="hover:text-gray-800">LinkedIn</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

