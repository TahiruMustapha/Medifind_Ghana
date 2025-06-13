// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/auth-context";
// import {
//   NavigationMenu,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu";
// import { Home, Plus, Settings, Calendar, MessageSquare } from "lucide-react";
// import { useToast } from "./ui/use-toast"
// export function NavBar() {
//   const { user, logout } = useAuth();

//   return (
//     <div className=" w-full  md:w-[80%] mx-auto">
//       <div className="z-10 w-full items-center justify-between text-sm flex p-4 border-b">
//         <Link href="/" className="text-2xl font-bold">
//           MediFind Ghana
//         </Link>

//         <div className="flex items-center gap-4">
//           <Link href="/about">About</Link>
//           <Link href="/search">Search</Link>

//           {user ? (
//             <>
//               {user?.role === "admin" && (
//                 <Link href="/admin">
//                   <Button variant="outline">Admin</Button>
//                 </Link>
//               )}

//               {user?.role === "pharmacy" && (
//                 <Link href="/pharmacy/dashboard">
//                   <Button variant="outline">Pharmacy Dashboard</Button>
//                 </Link>
//               )}

//               {user?.role === "user" && (
//                 <Link href="/dashboard">
//                   <Button variant="outline">Dashboard</Button>
//                 </Link>
//               )}

//               <Button variant="ghost" onClick={logout}>
//                 Logout
//               </Button>
//             </>
//           ) : (
//             <>
//               <Link href="/login">
//                 <Button className="" variant="outline">
//                   Login
//                 </Button>
//               </Link>
//               <Link href="/register">
//                 <Button>Register</Button>
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Calendar, MessageSquare, PlusCircle, ShoppingBag } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  return (
    <div className="w-full md:w-[80%] mx-auto">
      <div className="z-10 w-full items-center justify-between text-sm flex p-4 border-b">
        <Link href="/" className="text-2xl font-bold">
          MediFind Ghana
        </Link>

        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 bg-gray-500 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex w-full select-none flex-col  rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2  text-lg font-medium">
                            MediFind Ghana
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Find medicines, book consultations, and get expert
                            advice
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/search"
                        >
                          <div className="text-sm font-medium leading-none">
                            <ShoppingBag className="h-4 w-4 inline-block mr-2" />
                            Search Medicines
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Find medicines across pharmacies in Ghana
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/chat"
                        >
                          <div className="text-sm font-medium leading-none">
                            <MessageSquare className="h-4 w-4 inline-block mr-2" />
                            AI Medicine Chat
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Get advice about medications and usage
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          href="/bookings"
                        >
                          <div className="text-sm font-medium leading-none">
                            <Calendar className="h-4 w-4 inline-block mr-2" />
                            Book Consultation
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Schedule appointments with pharmacies
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    )}
                  >
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}

                {user?.role === "pharmacy" && (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Pharmacy</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-3 p-4">
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="/pharmacy/dashboard"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    Dashboard
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="/pharmacy/inventory/add"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    <PlusCircle className="h-4 w-4 inline-block mr-2" />
                                    Add Inventory
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="/pharmacy/bookings"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    <Calendar className="h-4 w-4 inline-block mr-2" />
                                    Manage Bookings
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                )}

                {user?.role === "user" && (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          My Account
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-3 p-4">
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="/dashboard"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    Dashboard
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink asChild>
                                <a
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  href="/bookings"
                                >
                                  <div className="text-sm font-medium leading-none">
                                    <Calendar className="h-4 w-4 inline-block mr-2" />
                                    My Bookings
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                )}

                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="" variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
