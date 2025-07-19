import React from "react";

export default function Loader() {
  return (
    <div className=" inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}


