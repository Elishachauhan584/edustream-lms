"use client";
import React from "react";
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 bg-white md:hidden" // Added md:hidden here
      >
        <SheetHeader className="pt-4 px-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-80px)] mt-[80px]">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
