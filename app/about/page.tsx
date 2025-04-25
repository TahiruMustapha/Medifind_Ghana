import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About MediFind Ghana</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                MediFind Ghana aims to improve access to essential medicines across Ghana by connecting patients with
                pharmacies that have their needed medications in stock. We believe that no one should have to visit
                multiple pharmacies to find the medicines they need.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-medium mb-2">Search</h3>
                  <p className="text-muted-foreground mb-4">
                    Search for medicines by name and location to find pharmacies that have them in stock.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-medium mb-2">Community Updates</h3>
                  <p className="text-muted-foreground mb-4">
                    Users can report medicine availability to help keep information accurate and up-to-date.
                  </p>
                </div>

                <div className="bg-card p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-medium mb-2">SMS Service</h3>
                  <p className="text-muted-foreground mb-4">
                    No internet? Use our SMS service to find medicines by sending a text message.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">For Pharmacies</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Pharmacies can register on our platform to manage their inventory and reach more customers. Our system
                helps pharmacies keep their medicine availability information up-to-date and connect with patients who
                need specific medications.
              </p>
              <Link href="/pharmacy/register">
                <Button>Register Your Pharmacy</Button>
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
              <p className="text-lg text-muted-foreground mb-2">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="mb-1">
                  <span className="font-medium">Email:</span> info@medifindghana.com
                </p>
                <p className="mb-1">
                  <span className="font-medium">Phone:</span> +233 XX XXX XXXX
                </p>
                <p>
                  <span className="font-medium">Address:</span> Accra, Ghana
                </p>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
              <p className="text-lg text-muted-foreground">
                MediFind Ghana was created by a team of healthcare professionals, pharmacists, and software developers
                committed to improving healthcare access in Ghana. We work closely with local pharmacies and healthcare
                providers to ensure our platform meets the needs of both patients and businesses.
              </p>
            </section>
          </div>
        </div>
      </div>

      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} MediFind Ghana. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
