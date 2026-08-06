import Navbar from '@/components/Navbar'

export default function JokeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  
 

  return <>
  <Navbar/>
  {children}
  </>
}
