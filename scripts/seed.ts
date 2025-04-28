import { PrismaClient } from "@prisma/client";

const database = new PrismaClient();

async function main() {
  try {
    await database.category.createMany({
      data: [
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Fitness" },
        { name: "Photography" },
        { name: "Accounting" },
        { name: "Engineering" },
        { name: "Filming" }, // capital F for consistency
      ],
    });

    console.log("✅ Success seeding the categories");
  } catch (error) {
    console.error("❌ Error seeding the database categories:", error);
  } finally {
    await database.$disconnect();
  }
}

// Don't forget to call main()
main();
