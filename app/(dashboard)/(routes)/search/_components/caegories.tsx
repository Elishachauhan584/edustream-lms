"use client"

import { Category } from "@prisma/client"
import {
    FcEngineering,
    FcFilmReel,
    FcMultipleDevices,
    FcMusic,
    FcOldTimeCamera,
    FcSalesPerformance,
    FcSportsMode
} from "react-icons/fc";
import { IconType } from "react-icons";
import { CategoryItems } from "./category-item";

interface CategoriesProps {
    items: Category[ ];
}
const iconMap: Record<Category["name"], IconType> = {
    "Music": FcMusic,
    "Photography": FcOldTimeCamera,
    "Fitness": FcSportsMode,
    "Accounting": FcSalesPerformance,
    "Computer": FcMultipleDevices,
    "Filmimg": FcFilmReel,
    "Engineering": FcEngineering,
};



export const Catrgories = ( {
    
    items,
 }: CategoriesProps) => {
    
    return (
        <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
           {items.map((item) => (
           <CategoryItems
            key={item.id}
            label={item.name}
            icon={iconMap[item.name]}
            value={item.id}
            />
           ))}
        </div>
    )
}