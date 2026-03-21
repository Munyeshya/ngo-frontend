import { Clock3, Mail, MapPin, Phone, Facebook, Twitter, Instagram } from 'lucide-react'
import Button from '../../components/ui/Button'

function ContactPage() {
  return (
    <div className="bg-[#F6F6F4]">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-[30px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="grid lg:grid-cols-[380px_1fr]">
            <div className="bg-black px-8 py-10 text-white sm:px-10 sm:py-12">
              <h1 className="max-w-xs text-4xl font-bold leading-tight">
                Share love,
                <br />
                donate hope.
              </h1>

              <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
                Reach out for partnerships, support, project information, or general questions about the platform and our impact work.
              </p>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-base font-medium text-white">KG 7 Ave, Kigali</p>
                  <p className="text-base text-white">Rwanda</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/85">
                    <Phone size={18} className="text-green-400" />
                    <span>+250 788 000 000</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/85">
                    <Mail size={18} className="text-green-400" />
                    <span>charity@email.net</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/85">
                    <Clock3 size={18} className="text-green-400" />
                    <span>Mon–Fri: 8:00am - 6:00pm</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/85">
                    <MapPin size={18} className="text-green-400" />
                    <span>Kigali, Rwanda</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3">
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>

            <div className="bg-[#F6F6F4] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <form className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">Phone Number</label>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">Message</label>
                  <textarea
                    rows="7"
                    placeholder="Message"
                    className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>

                <div className="pt-2">
                  <Button variant="primary" className="min-w-[190px] rounded-xl px-8">
                    SEND MESSAGE
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage