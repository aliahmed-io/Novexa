import { FooterForm } from "./FooterForm";

export function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <h3 className="text-xl font-bold">Novexa</h3>
            <p className="text-sm leading-6 text-gray-600">
              Premium clothing and accessories for the modern lifestyle.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            </div>
            <p className="text-xs leading-5 text-gray-700">
              &copy; 2024 Novexa. All Rights Reserved.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Shop</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a href="/store/shop?category=MEN" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Men</a>
                  </li>
                  <li>
                    <a href="/store/shop?category=WOMEN" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Women</a>
                  </li>
                  <li>
                    <a href="/store/shop?category=KIDS" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Kids</a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                {/* Placeholder for other links */}
              </div>
            </div>
            <div className="md:col-span-1 mt-10 md:mt-0">
              <h3 className="text-sm font-semibold leading-6 text-gray-900">Subscribe for updates</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
              <FooterForm />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}