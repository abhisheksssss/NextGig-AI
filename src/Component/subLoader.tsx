import React from "react";


export default function Loader() {
  return (
    <div className=" inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="w-11 h-11 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}


