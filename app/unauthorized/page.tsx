

 export default function UnauthorizedPage() {
   return (
     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
       <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
       <p className="mt-4 text-gray-700 dark:text-gray-300">
         You do not have permission to view this page. Please log in with the
         appropriate credentials.
       </p>
     </div>
   );
 }