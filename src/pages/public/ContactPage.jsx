import {
  Clock3,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import AnimatedBackground from '../../components/common/AnimatedBackground'

function ContactPage() {
  return (
    <div className="relative overflow-hidden bg-[#F6F6F4]">
      <AnimatedBackground variant="light" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <div className="bg-black px-6 py-8 text-white sm:px-8 sm:py-9">
              <h1 className="max-w-xs text-3xl font-bold leading-tight sm:text-[34px]">
                Share love,
                <br />
                donate hope.
              </h1>

              <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
                Reach out for partnerships, support, project information, or general questions.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-[15px] font-medium text-white">KG 7 Ave, Kigali</p>
                  <p className="text-[15px] text-white">Rwanda</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <Phone size={17} className="text-green-400" />
                    <span>+250 788 000 000</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <Mail size={17} className="text-green-400" />
                    <span>charity@email.net</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <Clock3 size={17} className="text-green-400" />
                    <span>Mon–Fri: 8:00am - 6:00pm</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <MapPin size={17} className="text-green-400" />
                    <span>Kigali, Rwanda</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
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

            <div className="bg-[#F6F6F4] px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Phone Number
                    </label>
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
                    rows="5"
                    placeholder="Message"
                    className="w-full rounded-xl border border-transparent bg-white px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>

                <div className="pt-1">
                  <Button variant="primary" className="min-w-[170px] rounded-xl px-7">
                    SEND MESSAGE
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-14">
        <div className="grid gap-6 lg:grid-cols-[0.42fr_1fr]">
          <div className="rounded-[24px] bg-black p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-lg font-semibold">Our Location</p>
                <p className="text-sm text-white/65">Visit or reach us directly</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm leading-7 text-white/80">
              <p>
                <span className="font-semibold text-white">Office:</span> KG 7 Ave, Kigali, Rwanda
              </p>
              <p>
                <span className="font-semibold text-white">Support Hours:</span> Monday to Friday,
                8:00am – 6:00pm
              </p>
              <p>
                <span className="font-semibold text-white">Nearby:</span> Central Kigali business
                area
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <iframe
              title="NGO Platform Location Map"
              src="https://www.google.com/maps?q=Kigali,Rwanda&z=13&output=embed"
              className="h-[280px] w-full border-0 sm:h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage