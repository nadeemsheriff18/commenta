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
    { question: "Is Commentta free?", answer: "Yes, we offer a free tier with limited features to get you started." },
    { question: "How does the AI generate comments?", answer: "Our AI uses your Knowledge Base and the context of the Reddit conversation to craft a relevant, helpful reply." },
    { question: "Can I use this for multiple products?", answer: "Yes. Each 'Project' in Commentta can be configured for a different product." },
  ];

  return (
    <div className="bg-white text-gray-800">
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.jpg" className="w-8 h-8 rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-900 font-pragati">Commentta</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Product</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>

          </nav>
          <div className="flex items-center space-x-2">
            
           <Link href='/projects'> <Button size="sm" className="bg-green-700 hover:bg-green-800">Go to Dashboard</Button></Link>
          </div>
        </div>
      </header>

      {/* --- MODIFIED: Added a single main container for consistent horizontal margins --- */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="container mx-auto px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-4xl font-bold tracking-tight text-gray-900 leading-tight font-alkalami">
                Be in the Right Reddit Conversations at the <span className="text-green-700">Right Time, Every Day</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 font-Atkinson">
                Reddit has leads and you’re missing the easiest way to talk to your customers every day. We find them early, help you write the perfect reply, and you post it in under a minute.<span className="text-blue-500"> This approach is already working  see the proof below</span>
              </p>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-x-4">
                <Button size="lg" className="bg-green-700 hover:bg-green-800 rounded-lg font-bold text-lg" onClick={handleGetStarted}>Start Now</Button>
                
              </div>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-x-6 text-sm text-gray-500">
                <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />Free plan available</span>
                <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />No credit card required</span>
                <span className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />Setup in few seconds</span>
              </div>
            </div>
            <div className="rounded-lg shadow-2xl">
              <div className="bg-gray-100 h-96 rounded-md flex items-center justify-center">
                <p className="text-gray-400 text-sm">[Product Dashboard Screenshot]</p>
              </div>
            </div>
          </div>
        </section>

        <section id="social-proof" className="py-16 sm:py-20">
  <div className="container mx-auto px-6">
    <div className="text-center max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-abhaya">
        Your Competitors Are Already Winning with This Approach
      </h2>
    </div>

    <div className="mt-20 max-w-5xl mx-auto space-y-24">
      {/* Testimonial 1 */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 font-andika">Big purchase influenced by Reddit. Real buyers. Real decisions. Right in the <span className="text-red-600"> Comments.</span></h3>
          <Button variant="outline" className="mt-6 bg-blue-500 text-white font-bold">See the proof</Button>
        </div>
        {/* --- MODIFIED: Added overflow-hidden to the container --- */}
        <div className="rounded-lg shadow-xl border-2 border-red-600 overflow-hidden">
          {/* --- MODIFIED: Added classes to the image to make it fit --- */}
          <img src="/proof1.png" alt="Testimonial proof 1" className="w-full h-full object-cover"/>
        </div>
      </div>

      {/* Testimonial 2 */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="lg:order-last">
          <h3 className="text-2xl font-bold text-gray-900 font-andika">Built on Reddit. $80K/Month. No Ads.</h3>
          <p className="mt-2 text-xl font-bold text-gray-900 font-andika">Pat grew Starter Story to $80K/month by showing up, helping others, and staying <span className="text-blue-600"> consistent.</span> Reddit worked for him — Commentta helps it work for you.</p>
          <Button variant="outline" className="mt-6 bg-blue-500 text-white font-bold">See the proof</Button>
        </div>
        <div className="rounded-lg shadow-xl border-2 border-red-600 overflow-hidden">
          <img src="/proof2.png" alt="Testimonial proof 2" className="w-full h-full object-cover"/>
        </div>
      </div>

      {/* Testimonial 3 */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 font-andika">Shimmer made $280K from Reddit in one year. No ads. Just real replies, real people, real trust. <br/><br/>You can do it too — and Commentta makes it 10x easier.</h3>
          <Button className="mt-6 bg-green-700 hover:bg-green-800 text-white font-bold">Start now</Button>
        </div>
        <div className="rounded-lg shadow-xl border-2 border-red-600">
          <div className="bg-gray-100 h-64 rounded-md flex items-center justify-center">
              <p className="text-gray-400 text-sm">[Screenshot Placeholder]</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

        <section id="demo" className="py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 font-abhaya">
              Watch this quick demo to see how Commentta works.
            </h2>
            <div className="mt-10 max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-200 aspect-video flex items-center justify-center">
                <p className="text-gray-500">[Project Demo Video]</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-5 px-6 py-16 sm:py-20 space-y-16">

          <div className="text-center max-w-4xl mx-auto">

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-abhaya">Start in 3 simple steps and let Commentta bring the right customers to you.</h2>
           <p className="font-alexandria mt-2 text-lg">Enter your website URL and let Commentta analyze your product, profile your audience, and start finding the right leads for you.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="rounded-lg shadow-2xl">

              <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">

                <p className="text-gray-400 text-sm">[App Screenshot: Scanning]</p>

              </div>

            </div>

            <div>

              <h3 className="text-2xl my-2 font-bold font-alice">Discover</h3>

              <h3 className="text-xl font-bold text-gray-900 font-alexandria">Commentta scans Reddit 24/7</h3>

              <p className="mt-2 text-gray-600 font-alexandria">We surface the right posts, rank them by priority, and generate replies that sound like you.</p>

              <ul className="mt-4 space-y-1 text-lg text-gray-700 font-bold font-alexandria">

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Real-time leads from Reddit</span></li>

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Add unlimited subreddits and keywords</span></li>

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Never miss a potential customer</span></li>

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Never miss a potential customer</span></li>

              </ul>

            </div>

          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="lg:order-last rounded-lg shadow-2xl">

              <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">

                <p className="text-gray-400 text-sm">[App Screenshot: Replying]</p>

              </div>

            </div>

            <div>

              <h3 className="text-2xl my-2 font-bold font-alice">Engage</h3>

              <h3 className="text-xl font-bold text-gray-900 font-alexandria">Commentta Crafts Replies That Sell</h3>

              <p className="mt-2 text-gray-600 font-alexandria">We read the thread, understand the user, and write a response that fits naturally.</p>

              <ul className="mt-4 space-y-1 text-lg font-bold text-gray-700 font-alexandria">

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Smart, Context-Aware Replies</span></li>

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Product Mentions That Don't Feel Forced</span></li>

                <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>Saves you hours of Trial-and-Error Writing</span></li>

              </ul>

            </div>

          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="rounded-lg shadow-2xl">

              <div className="bg-gray-100 h-72 rounded-md flex items-center justify-center">

                <p className="text-gray-400 text-sm">[App Screenshot: Analytics]</p>

              </div>

            </div>

            <div>

              <h3 className="text-2xl my-2 font-bold font-alice">Grow</h3>



              <h3 className="text-xl font-bold text-gray-900 font-alexandria">We alert you by email. You post the reply.</h3>

              <h3 className="text-xl font-bold text-gray-900 font-alexandria">Consistency turns comments into customers..</h3>



              <p className="mt-2 font-alexandria text-orange-500">Right thread, right words, right time. That’s it.</p>
<Button size="lg" className="bg-green-700 hover:bg-green-800 rounded-2xl font-bold mt-3 p-3 text-sm" onClick={handleGetStarted}>Catch a thread</Button>
              





            </div>

          </div>

        </section>

        <section id="faq" className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
              {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg text-left font-semibold hover:text-green-700">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="pricing" className="py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 font-abhaya">Plan and pricing</h2>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="flex flex-col shadow-lg border-2 rounded-2xl font-anek">
                <CardHeader><CardTitle className="text-xl font-bold">Free</CardTitle><CardDescription>Get started instantly</CardDescription></CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <p className="text-4xl font-bold">Try Free for 3 Days</p>
                  <div className="border-t pt-6">
                    <p className="font-semibold mb-4">What's Included</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />100 Subreddits Tracked</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Up to 100 Comments per Day</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />New Mentions Every 2 Hours</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Email Alerts Every 2 Hours</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Full Analytical Dashboard</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Create Multiple Projects</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter><Button variant="outline" className="w-full rounded-lg bg-green-700 text-white hover:bg-green-800" onClick={handleGetStarted}>Start free</Button></CardFooter>
              </Card>

              <Card className="flex flex-col shadow-lg border-2 border-green-700 rounded-2xl font-anek">
                <CardHeader><CardTitle className="text-xl font-bold">Commentta Pro</CardTitle><CardDescription>Access all of our premium features...</CardDescription></CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <p className="text-4xl font-bold">$50.00 for 30 days</p>
                  <div className="border-t pt-6">
                    <p className="font-semibold mb-4">What's Included</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />100 Subreddits Tracked</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Up to 100 Comments per Day</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />New Mentions Every 2 Hours</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Email Alerts Every 2 Hours</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Full Analytical Dashboard</li>
                      <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />Create Multiple Projects</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter><Button className="w-full rounded-lg bg-green-700 hover:bg-green-800" onClick={handleGetStarted}>Get Started</Button></CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-off-white border-t py-10">
  <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-700">
    {/* Column 1: Brand and Contact */}
    <div className="col-span-1 md:col-span-2">
      <h3 className="text-xl font-bold text-gray-900">Commentta</h3>
      <p className="mt-4 text-sm max-w-xs">
        Skip the scroll. We surface Reddit posts worth replying to.
      </p>
      <p className="mt-6 text-sm">
        Contact us: <a href="mailto:support@commentta.com" className="font-semibold text-green-700 hover:underline">support@commentta.com</a>
      </p>
    </div>

    {/* Column 2: Links */}
    <div>
      <h4 className="font-semibold text-gray-900">Product</h4>
      <ul className="mt-2 space-y-3 text-sm">
        <li><Link href="#features" className="hover:text-green-700">Features</Link></li>
        <li><Link href="#pricing" className="hover:text-green-700">Pricing</Link></li>
        <li><Link href="/blog" className="hover:text-green-700">Blog</Link></li>
      </ul>
    </div>

    {/* Column 3: Legal */}
    <div>
      <h4 className="font-semibold text-gray-900">Company</h4>
      <ul className="mt-2 space-y-3 text-sm">
        <li><Link href="#" className="hover:text-green-700">Terms & Conditions</Link></li>
        <li><Link href="#" className="hover:text-green-700">Privacy Policy</Link></li>
      </ul>
    </div>
  </div>

  <div className="container mx-auto px-6 mt-8 pt-8 border-t text-sm text-gray-500 text-center">
    <p>© {new Date().getFullYear()} Commentta. All rights reserved.</p>
  </div>
</footer>
    </div>
  );
}