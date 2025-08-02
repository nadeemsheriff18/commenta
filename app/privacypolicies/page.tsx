"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <header className="flex items-center gap-4 border-b pb-6 mb-10">
          <Image
            src="/logo.jpg"
            alt="Commentta Logo"
            width={50}
            height={50}
            className="rounded-md"
          />
          <div>
            <h1 className="text-2xl font-bold">Commentta</h1>
            <Link
              href="https://commentta.com"
              className="text-sm text-blue-600 hover:underline"
            >
              https://commentta.com
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          <section>
            <h2 className="text-3xl font-extrabold mb-2">
              Privacy Policies of Commentta
            </h2>
            {/*
            <p className="text-sm text-gray-500 mb-1">
              Effective Date: <span className="italic">[Insert Launch Date]</span>
            </p>
            */}
            <p className="mt-3 leading-relaxed">
              Your privacy matters to us. This Privacy Policy explains what information we collect, how we use it, and what choices you have. We’re builders ourselves, and we believe in doing things transparently and responsibly.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">1. What We Collect</h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Basic account info:</strong> Your email address when you sign up.
              </li>
              <li>
                <strong>Usage data:</strong> What features you use, what posts you engage with, and your preferences (to improve recommendations).
              </li>
              <li>
                <strong>Content:</strong> Any comments, drafts, or writing you submit or generate inside Commentta.
              </li>
              <li>
                <strong>Cookies:</strong> For login sessions, preferences, and basic analytics.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">2. What We Don’t Collect</h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>Track you across other websites.</li>
              <li>Read or access your private Reddit messages.</li>
              <li>Sell your data to third parties.</li>
              <li>Collect sensitive personal information (like address, government ID, etc.).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h3>
            <ul className="list-disc ml-6 space-y-3">
              <li>Run the product smoothly (e.g., keeping you logged in).</li>
              <li>Recommend better posts and comment opportunities.</li>
              <li>Improve Commentta based on how people use it.</li>
              <li>Occasionally send important product updates (never spam).</li>
            </ul>
            <p className="mt-4">
              We may also use <strong>anonymous usage data</strong> to guide development or share high-level stats (like "most common subreddits used").
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">4. Third-Party Services</h3>
            <p className="mb-3">
              We may use tools like:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Email tools:</strong> to send updates or alerts (only if you opt in).
              </li>
            </ul>
            <p className="mt-4">
              All third-party tools are carefully selected to align with our privacy values.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">5. Cookies</h3>
            <p className="mb-3">We use cookies to:</p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Understand which features are useful</li>
            </ul>
            <p className="mt-4">
              You can disable cookies in your browser, but some features may stop working.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">6. Data Storage & Security</h3>
            <p className="mb-4">
              We store data using secure, reputable infrastructure providers. We take reasonable steps to protect your data from loss, misuse, and unauthorized access.
            </p>
            <p>
              You can request deletion of your account and data at any time by emailing us at <span className="italic">[insert email]</span>.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">7. Your Rights</h3>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Access the data we have about you</li>
              <li>Request corrections</li>
              <li>Ask us to delete your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To do any of this, just reach out to <span className="italic">[email]</span> — we’ll respond promptly.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h3>
            <p className="mb-2">
              If we update this Privacy Policy, we’ll update the “Effective Date” at the top.
            </p>
            <p>
              We’ll notify you through the site or email if the changes are significant.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
