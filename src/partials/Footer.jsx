import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">EmPushy</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Discover notification trends 12+ months before everyone else.
              Track 10,000+ brands and stay ahead of the curve.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">X</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.954 4.569c-.885.39-1.83.654-2.825.775a4.958 4.958 0 002.163-2.724 9.868 9.868 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.978 13.978 0 011.671 3.15a4.922 4.922 0 001.523 6.573 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.924 4.924 0 004.6 3.417A9.868 9.868 0 010 19.54a13.945 13.945 0 007.548 2.209c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.535z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/80336170/"
                target="_blank"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/empushy"
                target="_blank"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.704-2.782.605-3.369-1.343-3.369-1.343-.454-1.159-1.11-1.466-1.11-1.466-.908-.62.069-.607.069-.607 1.004.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.089.636-1.34-2.22-.252-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.646 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.5.336c1.91-1.296 2.748-1.027 2.748-1.027.546 1.376.202 2.393.1 2.646.64.7 1.028 1.593 1.028 2.686 0 3.848-2.337 4.695-4.566 4.942.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.481A10.02 10.02 0 0022 12.017C22 6.484 17.523 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="http://localhost:5173/about"
                  target="_blank"
                  className="text-gray-600 hover:text-gray-900"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="https://blog.empushy.com/"
                  target="_blank"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:5173/newsletter"
                  target="_blank"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-400 text-sm">
            © 2025 EmPushy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
