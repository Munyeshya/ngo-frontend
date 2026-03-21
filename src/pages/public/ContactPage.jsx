import { Mail, MapPin, Phone } from 'lucide-react'
import SectionTitle from '../../components/common/SectionTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function ContactPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Contact us"
            title="We would love to hear from you"
            text="Get in touch for partnerships, questions, project information, or support."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Card className="rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-green-100 p-3 text-green-800">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Email</p>
                  <p className="mt-2 text-sm text-gray-600">info@ngo-platform.org</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-green-100 p-3 text-green-800">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Phone</p>
                  <p className="mt-2 text-sm text-gray-600">+250 788 000 000</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-green-100 p-3 text-green-800">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Location</p>
                  <p className="mt-2 text-sm text-gray-600">Kigali, Rwanda</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="rounded-[30px] p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900">Send a message</h3>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the form below and our team will get back to you.
            </p>

            <form className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">First name</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows="6"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  placeholder="Write your message"
                />
              </div>

              <Button className="w-full sm:w-auto">Send Message</Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default ContactPage