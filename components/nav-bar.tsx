"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function NavBar() {
  const { user, logout } = useAuth()

  return (
    <div className="z-10 w-full items-center justify-between text-sm flex p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        MediFind Ghana
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/about">About</Link>
        <Link href="/search">Search</Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            )}

            {user.role === "pharmacy" && (
              <Link href="/pharmacy/dashboard">
                <Button variant="outline">Pharmacy Dashboard</Button>
              </Link>
            )}

            {user.role === "user" && (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            )}

            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button className="" variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
