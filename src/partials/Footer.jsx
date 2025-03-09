import { NavLink } from "react-router-dom";

function Footer() {
    return (
        <footer className="border-t border-gray-300 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-lg font-bold">EmPushy</h3>
            <p className="mt-2 text-sm">Tracking trends in mobile and web push notifications.</p>
            <a className="mt-2 text-sm underline" href="https://billing.stripe.com/p/login/00g7ux7U91IodfW6oo" target="_blank">Manage API subscription</a>
          </div>
          <div>
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <NavLink
                    end
                    to="/about"
                    className="hover:underline">
                    About Us
                </NavLink>
              </li>
              <li>
                <a target="_blank"
                    href="https://blog.empushy.com"
                    className="hover:underline">
                    Blog
                </a>
              </li>
              <li>
                <NavLink
                    end
                    to="/newsletter"
                    className="hover:underline">
                    Newsletter
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold">Follow Us</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a target="_blank"
                    href="https://x.com/empathetic_push"
                    className="hover:underline">
                    X
                </a>
              </li>
              <li>
                <a target="_blank"
                    href="https://www.linkedin.com/company/80336170"
                    className="hover:underline">
                    LinkedIn
                </a>
              </li>
              <li> 
                <a target="_blank"
                    href="https://github.com/empushy"
                    className="hover:underline">
                    GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} EmPushy. All rights reserved.</div>
      </footer>
    );
  }
  
  export default Footer;