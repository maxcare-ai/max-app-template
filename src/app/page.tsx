import Link from "next/link";

const DEV_LINKS = [
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/test", label: "Component Test Page" },
];

export default function Home() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Max App Template</h1>
        <p className="text-gray-500 mb-8">
          Embedded application template for the MaxCare dashboard
        </p>

        {isDev && (
          <div className="mb-8 text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Dev Quick Links
            </h2>
            <div className="space-y-1.5">
              {DEV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <span className="text-gray-400 ml-2 text-xs">{link.href}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/api/health"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Health Check
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
