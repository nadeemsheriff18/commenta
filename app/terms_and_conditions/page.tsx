import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Site Header */}
        <header className="flex items-center gap-4 border-b pb-6 mb-8">
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

        {/* Page Title */}
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h2>
          
        </div>

        {/* Main Content */}
        <div className="space-y-10 text-gray-800 leading-relaxed">
          <section>
            <h3 className="text-2xl font-semibold mb-3">1. Introduction</h3>
            <p>
              Welcome to Commentta! We help you discover high-intent conversations
              on platforms like Reddit so you can share insights, build credibility,
              and offer help (and your product) naturally. By using this website or any
              of our services, you agree to the terms below. If you do not agree with
              these terms, please do not use Commentta.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">2. Who Can Use Commentta</h3>
            <ul className="list-disc ml-5 space-y-2">
              <li>Agree to follow these Terms and our Privacy Policy.</li>
              <li>Use the platform responsibly, without abusing or misusing it.</li>
              <li>
                If using on behalf of an organization, ensure you’re authorized to
                accept the terms for them.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">3. What You Can and Cannot Do</h3>
            <p className="mb-2 font-medium">You can:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Use Commentta to find relevant online discussions.</li>
              <li>Write and submit comment drafts using our tools.</li>
              <li>Use it to grow your knowledge base or share your expertise.</li>
            </ul>

            <p className="mt-4 mb-2 font-medium">You cannot:</p>
            <ul className="list-disc ml-5 space-y-2">
              <li>Copy, resell, or redistribute Commentta’s tools or content.</li>
              <li>Spam, harass, or mislead people through the platform.</li>
              <li>Use Commentta for scams, hate speech, or illegal content.</li>
              <li>Reverse-engineer, hack, or exploit the service.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">4. User Content & Comments</h3>
            <p>
              You own the content (comments, drafts, insights) you post. By submitting
              it, you allow us to:
            </p>
            <ul className="list-disc ml-5 space-y-2 mt-2">
              <li>Store and process it to improve your experience.</li>
              <li>Use anonymized versions for internal testing or analytics.</li>
            </ul>
            <p className="mt-2">
              We never sell or publicly share your content without your consent.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">5. Intellectual Property</h3>
            <p>
              All rights to Commentta — including design, branding, software, and
              content — belong to us unless otherwise stated.
            </p>
            <ul className="list-disc ml-5 space-y-2 mt-2">
              <li>Do not use our branding or content without permission.</li>
              <li>Do not create a competing product using our ideas or code.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">6. Data and Privacy</h3>
            <p>
              We collect only the data necessary to operate and improve Commentta.
              We do not sell your data. See our full{" "}
              <Link href="/privacy-policy" className="text-blue-600 underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h3>
            <p>
              While we aim to provide a reliable product, we can't guarantee:
            </p>
            <ul className="list-disc ml-5 space-y-2 mt-2">
              <li>That the site will always be perfect or available.</li>
              <li>
                That your external platform accounts (e.g. Reddit) won’t be affected.
              </li>
            </ul>
            <p className="mt-2">
              You agree that we’re not liable for losses from using the platform
              unless caused by our negligence and cannot legally be waived.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">8. Termination</h3>
            <p>
              You may stop using Commentta at any time. We may suspend or terminate
              your access if you violate these terms or misuse the platform.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-3">9. Changes to These Terms</h3>
            <p>
              We may update these terms over time. When we do, we’ll revise the
              “Effective Date” above and notify you if changes are significant.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
