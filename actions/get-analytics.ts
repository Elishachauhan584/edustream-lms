import { db } from "@/lib/db";
import {Course, Purchase }from "@prisma/client";

type PurchaseWithCourse = Purchase & {
    course: Course;
};

const groupByCourse = (purchase: PurchaseWithCourse[] )=> {
 const groupd: { [courseTitle: string]: number }= { };

 purchase.forEach(( purchase) => {
    const courseTitle = purchase.course.title;
    if(!groupd[courseTitle]) {
        groupd[courseTitle] = 0;
    }
    groupd[courseTitle] += purchase.course.price!;
 });
 return groupd;
};

export const getAnalytics = async(userId: string ) =>{
    try{
      const purchases = await db.purchase.findMany({
        where:{
            course:{
                userId: userId
            }
        },
        include:{
            course: true,
        }
      });

      const groupedEarnings = groupByCourse(purchases);
      const data = Object.entries(groupedEarnings).map(([ courseTitle, total]) => ({ 
        name: courseTitle,
        total:total,
      }));

      const totalRevenu = data.reduce(( acc,curr)=> acc + curr.total,0);
      const totalSales = purchases.length;

      return{
        data,
        totalRevenu,
        totalSales,
      }
    }catch(error){
        console.log("[GET_ANALYTICS]", error);
        return {
            data: {
                totalRevenue: 0,
                totalSales:0
            }
        }
    }
}
