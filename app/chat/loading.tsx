// import { Skeleton } from "@/components/ui/sketeton"
// import { NavBar } from "@/components/nav-bar"
// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
// import { Bot } from "lucide-react"

// export default function Loading() {
//   return (
//     <main className="flex min-h-screen flex-col">
//       {/* <NavBar /> */}

//       <div className="flex-1 p-4 md:p-8">
//         <div className="max-w-3xl mx-auto">
//           <Skeleton className="h-8 w-64 mb-2" />
//           <Skeleton className="h-5 w-full max-w-md mb-6" />

//           <Card className="mb-4">
//             <CardHeader className="pb-2">
//               <Skeleton className="h-6 w-40 mb-1" />
//               <Skeleton className="h-4 w-full" />
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-5/6" />
//                 <Skeleton className="h-4 w-4/6" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-4">
//               <div className="h-[50vh] flex items-center justify-center">
//                 <div className="text-center">
//                   <Bot className="mx-auto h-12 w-12 mb-2 opacity-50" />
//                   <Skeleton className="h-5 w-40 mx-auto mb-4" />
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
//                     <Skeleton className="h-10 w-full" />
//                     <Skeleton className="h-10 w-full" />
//                     <Skeleton className="h-10 w-full" />
//                     <Skeleton className="h-10 w-full" />
//                   </div>
//                 </div>
//               </div>

//               <div className="relative mt-4">
//                 <Skeleton className="h-10 w-full" />
//               </div>
//             </CardContent>
//             <CardFooter className="border-t px-4 py-3">
//               <Skeleton className="h-4 w-48" />
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </main>
//   )
// }
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/sketeton"
import { Bot } from "lucide-react"

export default function ChatLoading() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">MediBot</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">Loading your AI assistant...</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-16 w-3/4 rounded-lg" />
              </div>
              <div className="flex gap-4 justify-end">
                <Skeleton className="h-12 w-1/2 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
            <div className="border-t p-6">
              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
