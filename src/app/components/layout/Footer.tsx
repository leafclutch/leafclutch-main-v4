"use client";

import Link from "next/link";
import { useAdmin } from "@/app/context/AdminContext";
const logoImg = "/footer.png";

const companyLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Training & Internship", to: "/training" },
  { label: "Services", to: "/services" },
  { label: "Products", to: "/products" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "mailto:info@leafclutchtech.com.np" },
];


const resourceLinks = [
  { label: "Blog & Insights", to: "#" },
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
];

export default function Footer() {
  const { companyServices, services: products } = useAdmin();

  // §29: the footer lists services and products dynamically, so adding one in
  // the admin panel puts it here automatically.
  const serviceLinks = companyServices
    .filter((s) => s.status === "active")
    .sort((a, b) => a.order - b.order)
    .slice(0, 6)
    .map((s) => ({ label: s.title, to: `/services/${s.id}` }));

  const productLinks = products
    .slice(0, 6)
    .map((p) => ({ label: p.title, to: `/products/${p.id}` }));

  return (
    <footer className="nepal-footer relative overflow-hidden border-t-4 border-[#0EA5EB] bg-linear-to-b from-[#0B1D36] to-[#062165]">
      <div
        className="nepal-footer-skyline absolute inset-x-0 bottom-full z-0 leading-none pointer-events-none select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 190"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-12"
        >
          <path
            d="M0 122 C145 88 245 137 380 104 C540 65 628 137 770 104 C930 67 1055 132 1190 96 C1300 67 1370 93 1440 78 L1440 190 L0 190Z"
            fill="#0EA5EB"
            opacity=".16"
          />
          <path
            d="M0 150 C180 121 288 160 430 133 C584 104 704 156 850 130 C1012 101 1134 157 1280 126 C1350 111 1404 119 1440 111 L1440 190 L0 190Z"
            fill="#0B1D36"
          />

          <g fill="#0B1D36">
            <path d="M56 137V91H76V137ZM48 91H84L66 73Z" />
            <path d="M91 137V103H112V137ZM85 103H118L101 86Z" />
            <path d="M132 137V82H158V137ZM123 82H167L145 59Z" />
            <path d="M128 74H162L145 48Z" />
            <path d="M127 80H163V86H127Z" />
            <path d="M124 91H166V97H124Z" />
            <path d="M120 105H170V111H120Z" />

            <path d="M1185 137V91H1206V137ZM1177 91H1214L1195 72Z" />
            <path d="M1230 137V104H1252V137ZM1224 104H1258L1241 87Z" />
            <path d="M1280 137V78H1307V137ZM1272 78H1315L1293 55Z" />
            <path d="M1276 74H1311V80H1276Z" />
            <path d="M1272 89H1315V95H1272Z" />
            <path d="M1268 104H1319V110H1268Z" />
          </g>

          <g fill="#062165">
            <path d="M0 143V113H18V143ZM-5 113H23L9 99Z" />
            <path d="M184 143V111H205V143ZM178 111H211L194 94Z" />
            <path d="M1080 143V110H1101V143ZM1074 110H1107L1090 92Z" />
            <path d="M1340 143V101H1364V143ZM1333 101H1371L1352 81Z" />
            <path d="M1400 143V116H1420V143ZM1395 116H1425L1410 101Z" />
          </g>

          <g fill="#0B1D36">
            <path d="M663 143V116H777V143Z" />
            <path d="M648 116H792L720 82Z" />
            <path d="M665 106H775L720 70Z" />
            <path d="M686 94H754L720 59Z" />
            <path d="M716 52H724V32H716Z" />
            <circle cx="720" cy="27" r="5" />
            <path
              d="M690 143V124H708V143ZM732 143V124H750V143Z"
              fill="#edf7ff"
              opacity=".55"
            />
          </g>

          <g fill="none" stroke="#0B1D36" strokeWidth="3">
            <path d="M300 138V103M300 103C280 92 269 76 274 60M300 103C319 91 331 76 326 59" />
            <path d="M1005 138V100M1005 100C986 87 975 71 980 55M1005 100C1024 87 1036 71 1031 55" />
          </g>
          <g fill="#12B987">
            <path d="M274 60L286 65L275 72Z" />
            <path d="M326 59L314 65L325 72Z" />
            <path d="M980 55L992 60L981 67Z" />
            <path d="M1031 55L1019 60L1030 67Z" />
          </g>
          <g fill="#0EA5EB" opacity=".85">
            <circle cx="248" cy="55" r="3" />
            <circle cx="351" cy="43" r="4" />
            <circle cx="1144" cy="49" r="3" />
            <circle cx="1160" cy="66" r="4" />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1.4fr_1fr] gap-6 pb-6 border-b border-white/10">
          {/* Brand column */}
          <div>
            <div className="inline-block rounded-xl px-4 py-2 mb-4 shadow-lg">
              <img
                src={logoImg}
                alt="Leafclutch Technologies Pvt. Ltd."
                className="h-18 w-auto"
              />
            </div>
            <p className="text-[#AEC0DE] text-sm leading-relaxed mb-3 max-w-xs">
              Empowering innovation through cutting-edge technology solutions,
              training, and digital transformation services.
            </p>

            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#16D0AB] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@leafclutchtech.com.np"
                  className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                >
                  info@leafclutchtech.com.np
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#16D0AB] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+9779766715768"
                  className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                >
                  +977-9766715768
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[#16D0AB] shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-[#AEC0DE] text-sm">
                  Siddharthanagar, Rupandehi
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.to}
                    className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#7C93BE] text-sm">
            © {new Date().getFullYear()} Leafclutch Technologies. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#AEC0DE] text-sm hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
