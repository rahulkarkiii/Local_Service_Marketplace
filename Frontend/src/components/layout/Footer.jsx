import { Link } from "react-router-dom"
import { Wrench, MapPin, Phone, Mail, Share2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">SewaNepal</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nepal's most trusted local service marketplace. Verified professionals, transparent pricing, secure payments via Khalti.
            </p>
            <div className="flex gap-2">
              <a href="#" className="h-9 w-9 rounded-xl bg-white border grid place-items-center hover:bg-zinc-900 hover:text-white transition-colors"><Share2 className="h-4 w-4"/></a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white border grid place-items-center hover:bg-zinc-900 hover:text-white transition-colors"><Share2 className="h-4 w-4"/></a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white border grid place-items-center hover:bg-zinc-900 hover:text-white transition-colors"><Share2 className="h-4 w-4"/></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-foreground">Browse Services</Link></li>
              <li><Link to="/providers" className="hover:text-foreground">Find Providers</Link></li>
              <li><Link to="/register" className="hover:text-foreground">Become a Provider</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-foreground">How it Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/reports" className="hover:text-foreground">Report an Issue</Link></li>
              <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground">Safety & Trust</a></li>
              <li><a href="#" className="hover:text-foreground">Terms & Privacy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0"/> Kathmandu, Nepal</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0"/> +977 9800000000</li>
              <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0"/> hello@sewanepal.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SewaNepal. All rights reserved.</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/> All systems operational • Secure payments via Khalti</span>
        </div>
      </div>
    </footer>
  )
}
