// "use client";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { AlertCircle, CheckCircle2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { ChangeEvent, FormEvent, useState } from "react";

// export default function PharmacyRegister() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [requiresVerification, setRequiresVerification] = useState(false);
//   const [registeredEmail, setRegisteredEmail] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     location: "",
//     region: "",
//     address: "",
//     operatingHours:"",
//     contactNumber: "",
//     email: "",
//     licenseNumber: "",
//     ownerName: "",
//     password: "",
//     confirmPassword: "",
//     agreeTerms: false,
//   });

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value, type } = e.target;
//     const isCheckbox = type === "checkbox";
//     setFormData((prev) => ({
//       ...prev,
//       [name]:
//         isCheckbox && "checked" in e.target
//           ? (e.target as HTMLInputElement).checked
//           : value,
//     }));
//   };

//   // const handleSelectChange = (name: string, value: string) => {
//   //   setFormData((prev) => ({
//   //     ...prev,
//   //     [name]: value,
//   //   }));
//   // };
//   const handleSelectChange = (name: string, value: string) => {
//     console.log("Updating:", name, value);
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
//   const handleVerify = () => {
//     router.push(`/verify?email=${registeredEmail}`);
//   };
//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // Validate form
//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     if (!formData.agreeTerms) {
//       setError("You must agree to the terms and conditions");
//       setLoading(false);
//       return;
//     }

//     try {
//       // Register user account first
//       const userResponse = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           data: {
//             name: formData.ownerName,
//             email: formData.email,
//             phoneNumber: formData.contactNumber,
//             password: formData.password,
//             role: "pharmacy",
//           },
//         }),
//       });

//       const userData = await userResponse.json();
//       if (userResponse.ok) {
//         setSuccess(true);
//         setRegisteredEmail(formData.email);

//         if (userData.requiresVerification) {
//           setRequiresVerification(true);
//         } else {
//           // Redirect after a delay
//           setTimeout(() => {
//             router.push("/login");
//           }, 3000);
//         }
//       }
//       if (!userResponse.ok) {
//         throw new Error("Failed to create user account");
//       }

//       // Register pharmacy with user ID
//       const pharmacyResponse = await fetch("/api/pharmacies", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           location: formData.location,
//           region: formData.region,
//           address: formData.address,
//           operatingHours:formData.operatingHours,
//           contactNumber: formData.contactNumber,
//           email: formData.email,
//           licenseNumber: formData.licenseNumber,
//           userId: userData.userId,
//           verified: false,
//         }),
//       });

//       const pharmacyData = await pharmacyResponse.json();

//       if (!pharmacyResponse.ok) {
//         throw new Error(pharmacyData.error || "Failed to register pharmacy");
//       }

//       setSuccess(true);

//       // Redirect after a delay
//       // setTimeout(() => {
//       //   router.push("/pharmacy/pending-verification");
//       // }, 3000);
//     } catch (error) {
//       console.error("Registration error:", error);
//       setError("An error occurred during registration");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className=" flex min-h-screen flex-col p-4 md:p-8">
//       <div className="max-w-3xl mx-auto w-full">
//         <h1 className="text-2xl font-bold mb-6">Pharmacy Registration</h1>

//         {error && (
//           <Alert>
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         {success && (
//           <Alert className="mb-6 bg-green-50 border-green-200">
//             <CheckCircle2 className="h-4 w-4 text-green-600" />
//             <AlertTitle>Registration Successful</AlertTitle>
//             <AlertDescription>
//               {requiresVerification
//                 ? "Your account has been created. Please verify your account to continue."
//                 : "Your account has been created successfully. You will be redirected to the login page shortly."}

//               {requiresVerification && (
//                 <Button
//                   variant="outline"
//                   className="mt-2 bg-green-100 border-green-200 text-green-800 hover:bg-green-200 hover:text-green-900"
//                   onClick={handleVerify}
//                 >
//                   Verify Account
//                 </Button>
//               )}
//             </AlertDescription>
//           </Alert>
//         )}
//         {/* {success && (
//           <Alert className="mb-6 bg-green-50 border-green-200">
//             <AlertTitle>Registration Successful</AlertTitle>
//             <AlertDescription>
//               Your pharmacy has been registered successfully. It is now pending
//               verification. You will be redirected shortly.
//             </AlertDescription>
//           </Alert>
//         )} */}

//         <Card>
//           <CardHeader>
//             <CardTitle>Register Your Pharmacy</CardTitle>
//             <CardDescription>
//               Join MediFind Ghana to help patients find medicines more easily
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">Pharmacy Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="name">Pharmacy Name *</Label>
//                     <Input
//                       id="name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="licenseNumber">License Number *</Label>
//                     <Input
//                       id="licenseNumber"
//                       name="licenseNumber"
//                       value={formData.licenseNumber}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="location">City/Town *</Label>
//                     <Input
//                       id="location"
//                       name="location"
//                       value={formData.location}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="region">Region *</Label>

//                     <Select
//                       value={formData.region}
//                       onValueChange={(value) =>
//                         handleSelectChange("region", value)
//                       }
//                       required
//                     >
//                       <SelectTrigger id="region">
//                         <SelectValue placeholder="Select region" />
//                       </SelectTrigger>

//                       <SelectContent>
//                         <SelectItem value="greater-accra">
//                           Greater Accra
//                         </SelectItem>
//                         <SelectItem value="ashanti">Ashanti</SelectItem>
//                         <SelectItem value="western">Western</SelectItem>
//                         <SelectItem value="eastern">Eastern</SelectItem>
//                         <SelectItem value="central">Central</SelectItem>
//                         <SelectItem value="northern">Northern</SelectItem>
//                         <SelectItem value="upper-east">Upper East</SelectItem>
//                         <SelectItem value="upper-west">Upper West</SelectItem>
//                         <SelectItem value="volta">Volta</SelectItem>
//                         <SelectItem value="bono">Bono</SelectItem>
//                         <SelectItem value="bono-east">Bono East</SelectItem>
//                         <SelectItem value="ahafo">Ahafo</SelectItem>
//                         <SelectItem value="savannah">Savannah</SelectItem>
//                         <SelectItem value="north-east">North East</SelectItem>
//                         <SelectItem value="oti">Oti</SelectItem>
//                         <SelectItem value="western-north">
//                           Western North
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="address">Full Address *</Label>
//                   <Textarea
//                     id="address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="contactNumber">Contact Number *</Label>
//                     <Input
//                       id="contactNumber"
//                       name="contactNumber"
//                       value={formData.contactNumber}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email Address *</Label>
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                 </div>
//                 <div className="space-y-2">
//                     <Label htmlFor="operatingHours">Operating Hours *</Label>
//                     <Input
//                       id="operatingHours"
//                       name="operatingHours"
//                       type="text"
//                       value={formData.operatingHours}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//               </div>
//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">Account Information</h3>

//                 <div className="space-y-2">
//                   <Label htmlFor="ownerName">Owner/Manager Name *</Label>
//                   <Input
//                     id="ownerName"
//                     name="ownerName"
//                     value={formData.ownerName}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password *</Label>
//                     <Input
//                       id="password"
//                       name="password"
//                       type="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="confirmPassword">Confirm Password *</Label>
//                     <Input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type="password"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="agreeTerms"
//                     name="agreeTerms"
//                     checked={formData.agreeTerms}
//                     onCheckedChange={(checked) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         agreeTerms: checked === true,
//                       }))
//                     }
//                   />
//                   <label
//                     htmlFor="agreeTerms"
//                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                   >
//                     I agree to the terms and conditions and privacy policy
//                   </label>
//                 </div>
//               </div>
//               <CardFooter className="px-0 pt-4">
//                 <Button type="submit" className="w-full" disabled={loading}>
//                   {loading ? "Registering..." : "Register Pharmacy"}
//                 </Button>
//               </CardFooter>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   );
// }

"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";

// Define available services
const availableServices = [
  { id: "consultation", label: "General Consultation" },
  { id: "prescription_review", label: "Prescription Review" },
  { id: "health_screening", label: "Health Screening" },
  { id: "vaccination", label: "Vaccination Services" },
  { id: "medication_counseling", label: "Medication Counseling" },
  { id: "chronic_disease_management", label: "Chronic Disease Management" },
  { id: "blood_pressure", label: "Blood Pressure Monitoring" },
  { id: "glucose_testing", label: "Blood Glucose Testing" },
  { id: "other", label: "Other Services" },
];

export default function PharmacyRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    region: "",
    address: "",
    operatingHours: "",
    contactNumber: "",
    email: "",
    licenseNumber: "",
    ownerName: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    services: [] as string[],
    servicePricing: {
      consultation: 0,
      prescription_review: 0,
      health_screening: 0,
      vaccination: 0,
      medication_counseling: 0,
      chronic_disease_management: 0,
      blood_pressure: 0,
      glucose_testing: 0,
      other: 0,
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]:
        isCheckbox && "checked" in e.target
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log("Updating:", name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      services: checked
        ? [...prev.services, serviceId]
        : prev.services.filter((id) => id !== serviceId),
    }));
  };

  const handleServicePriceChange = (serviceId: string, price: string) => {
    setFormData((prev) => ({
      ...prev,
      servicePricing: {
        ...prev.servicePricing,
        [serviceId]: Number.parseFloat(price) || 0,
      },
    }));
  };

  const handleVerify = () => {
    router.push(`/verify?email=${registeredEmail}`);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    if (formData.services.length === 0) {
      setError("Please select at least one service that your pharmacy offers");
      setLoading(false);
      return;
    }

    try {
      // Register user account first
      const userResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            name: formData.ownerName,
            email: formData.email,
            phoneNumber: formData.contactNumber,
            password: formData.password,
            role: "pharmacy",
          },
        }),
      });

      const userData = await userResponse.json();
      if (userResponse.ok) {
        setSuccess(true);
        setRegisteredEmail(formData.email);

        if (userData.requiresVerification) {
          setRequiresVerification(true);
        } else {
          // Redirect after a delay
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      }
      if (!userResponse.ok) {
        throw new Error("Failed to create user account");
      }

      // Create service pricing object with only selected services
      const servicePricing: Record<string, number> = {};
      formData.services.forEach((service) => {
        servicePricing[service] =
          formData.servicePricing[
            service as keyof typeof formData.servicePricing
          ] || 0;
      });

      // Register pharmacy with user ID
      const pharmacyResponse = await fetch("/api/pharmacies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          region: formData.region,
          address: formData.address,
          operatingHours: formData.operatingHours,
          contactNumber: formData.contactNumber,
          email: formData.email,
          licenseNumber: formData.licenseNumber,
          userId: userData.userId,
          verified: false,
          services: formData.services,
          servicePricing: servicePricing,
        }),
      });

      const pharmacyData = await pharmacyResponse.json();

      if (!pharmacyResponse.ok) {
        throw new Error(pharmacyData.error || "Failed to register pharmacy");
      }

      setSuccess(true);

      // Redirect after a delay
      // setTimeout(() => {
      //   router.push("/pharmacy/pending-verification");
      // }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Pharmacy Registration</h1>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Registration Successful</AlertTitle>
            <AlertDescription>
              {requiresVerification
                ? "Your account has been created. Please verify your account to continue."
                : "Your account has been created successfully. You will be redirected to the login page shortly."}

              {requiresVerification && (
                <Button
                  variant="outline"
                  className="mt-2 bg-green-100 border-green-200 text-green-800 hover:bg-green-200 hover:text-green-900"
                  onClick={handleVerify}
                >
                  Verify Account
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Register Your Pharmacy</CardTitle>
            <CardDescription>
              Join MediFind Ghana to help patients find medicines more easily
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pharmacy Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Pharmacy Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Town *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>

                    <Select
                      value={formData.region}
                      onValueChange={(value) =>
                        handleSelectChange("region", value)
                      }
                      required
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="greater-accra">
                          Greater Accra
                        </SelectItem>
                        <SelectItem value="ashanti">Ashanti</SelectItem>
                        <SelectItem value="western">Western</SelectItem>
                        <SelectItem value="eastern">Eastern</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="northern">Northern</SelectItem>
                        <SelectItem value="upper-east">Upper East</SelectItem>
                        <SelectItem value="upper-west">Upper West</SelectItem>
                        <SelectItem value="volta">Volta</SelectItem>
                        <SelectItem value="bono">Bono</SelectItem>
                        <SelectItem value="bono-east">Bono East</SelectItem>
                        <SelectItem value="ahafo">Ahafo</SelectItem>
                        <SelectItem value="savannah">Savannah</SelectItem>
                        <SelectItem value="north-east">North East</SelectItem>
                        <SelectItem value="oti">Oti</SelectItem>
                        <SelectItem value="western-north">
                          Western North
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours *</Label>
                  <Input
                    id="operatingHours"
                    name="operatingHours"
                    type="text"
                    placeholder="e.g., Mon-Fri: 8am-6pm, Sat: 9am-3pm, Sun: Closed"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Services Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Pharmacy Services *</h3>
                  <p className="text-sm text-gray-500">
                    Select the services your pharmacy offers. You can set
                    pricing for paid services.
                  </p>

                  <div className="space-y-4">
                    {availableServices.map((service) => (
                      <div key={service.id} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={formData.services.includes(service.id)}
                            onCheckedChange={(checked) =>
                              handleServiceChange(service.id, checked === true)
                            }
                          />
                          <Label
                            htmlFor={`service-${service.id}`}
                            className="font-medium"
                          >
                            {service.label}
                          </Label>
                        </div>

                        {formData.services.includes(service.id) && (
                          <div className="ml-6 flex items-center space-x-2">
                            <Label
                              htmlFor={`price-${service.id}`}
                              className="text-sm w-24"
                            >
                              Price (GHS):
                            </Label>
                            <Input
                              id={`price-${service.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-24"
                              value={
                                formData.servicePricing[
                                  service.id as keyof typeof formData.servicePricing
                                ]
                              }
                              onChange={(e) =>
                                handleServicePriceChange(
                                  service.id,
                                  e.target.value
                                )
                              }
                            />
                            <span className="text-sm text-gray-500">
                              (Leave as 0 for free service)
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Account Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeTerms: checked === true,
                      }))
                    }
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the terms and conditions and privacy policy
                  </label>
                </div>
              </div>
              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registering..." : "Register Pharmacy"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
