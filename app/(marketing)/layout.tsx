import { Suspense } from "react";
import { Navbar } from "./_components/navbar";

const MarketingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full dark:bg-[#1F1F1F]">
      <Suspense>
        <Navbar />
        <main className="h-full pt-40">
          {children}
        </main>
      </Suspense>
    </div>
   );
}
 
export default MarketingLayout;
