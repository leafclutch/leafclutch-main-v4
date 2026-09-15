import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import SocialRail from '../components/layout/SocialRail'

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SocialRail />
      <div className="flex min-w-0 flex-1 flex-col md:pl-18">
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}