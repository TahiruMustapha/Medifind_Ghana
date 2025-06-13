import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NavBar } from "@/components/nav-bar"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      {/* <NavBar /> */}

      <div className="flex  flex-col items-center justify-center mt-2 w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-6">Find medicines available near you</h2>
        <p className="text-center text-muted-foreground mb-8">
          Search for medicines across pharmacies in Ghana and get real-time availability information
        </p>

        <div className="flex w-full max-w-lg gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search for medicines..." className="pl-10 w-full" />
          </div>
          <Link href="/search">
            <Button type="submit">Search</Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="mb-2">No internet? Use our SMS service:</p>
          <div className="bg-muted p-3 rounded-md">
            <code>Send "FIND [MEDICINE] [LOCATION]" to +233XXXXXXXX</code>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">For Patients</h3>
          <p className="text-muted-foreground mb-4">Find medicines quickly without visiting multiple pharmacies</p>
          <Link href="/search">
            <Button variant="outline" className="w-full">
              Search Medicines
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">For Pharmacies</h3>
          <p className="text-muted-foreground mb-4">Update your inventory and reach more customers</p>
          <Link href="/pharmacy/register">
            <Button variant="outline" className="w-full">
              Register Pharmacy
            </Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">Community Updates</h3>
          <p className="text-muted-foreground mb-4">Help others by reporting medicine availability</p>
          <Link href="/contribute">
            <Button variant="outline" className="w-full">
              Contribute
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
