import "dotenv/config"; // Add this line
import { PrismaClient, FoodCategory } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const foodData = [
  // --- Breakfast Items (Mapped to NORMAL category) ---
  {
    name: "እንቁላል ፍርፍር (Inkulal Firfir)",
    price: 120.0,
    category: FoodCategory.NORMAL,
    imageUrl: "https://www.asmarino.com/wp-content/uploads/2022/01/enku.jpeg",
  },
  {
    name: "ፉል በአቮካዶ (Ful with Avocado)",
    price: 150.0,
    category: FoodCategory.NORMAL,
    imageUrl:
      "https://live.staticflickr.com/65535/52011737402_18f26a1abe_b.jpg",
  },
  {
    name: "ጨጨብሳ (Chechebsa)",
    price: 110.0,
    category: FoodCategory.NORMAL,
    imageUrl: "https://i.ytimg.com/vi/h2434fP0ars/maxresdefault.jpg",
  },

  // --- Main Dishes (Mapped to NORMAL category) ---
  {
    name: "ፓስታ በስጋ (Pasta with Meat)",
    price: 180.0,
    category: FoodCategory.NORMAL,
    imageUrl:
      "https://www.vegrecipesofindia.com/wp-content/uploads/2021/05/masala-pasta-1.jpg",
  },
  {
    name: "ሩዝ በአትክልት (Rice with Vegetables)",
    price: 160.0,
    category: FoodCategory.NORMAL,
    imageUrl:
      "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/12/veg-fried-rice-recipe.jpg",
  },

  // --- Specialty Dishes (Mapped to SPECIAL category) ---
  {
    name: "በየአይነቱ (Beyaynetu Platter)",
    price: 250.0,
    category: FoodCategory.SPECIAL,
    imageUrl:
      "https://i0.wp.com/www.gourmetethiopiancuisine.com/wp-content/uploads/2020/09/Veggie-Platter-scaled.jpg?fit=2560%2C1920&ssl=1",
  },
  {
    name: "ልዩ ክትፎ (Special Kitfo)",
    price: 350.0,
    category: FoodCategory.SPECIAL,
    imageUrl:
      "https://www.willflyforfood.net/wp-content/uploads/2022/04/ethiopian-food-kitfo.jpg",
  },
  {
    name: "ተጋቢኖ ሽሮ (Tegabino Shiro)",
    price: 220.0,
    category: FoodCategory.SPECIAL,
    imageUrl: "https://i.ytimg.com/vi/bYy3gqiXgug/maxresdefault.jpg",
  },
  {
    name: "ዶሮ ወጥ (Doro Wat)",
    price: 380.0,
    category: FoodCategory.SPECIAL,
    imageUrl:
      "https://www.daringgourmet.com/wp-content/uploads/2018/11/Doro-Wat-5-square.jpg",
  },

  // --- Hot Drinks (Mapped to HOTDRINK category) ---
  {
    name: "ቡና (Ethiopian Coffee)",
    price: 50.0,
    category: FoodCategory.HOTDRINK,
    imageUrl:
      "https://www.nespresso.com/ncp/res/uploads/recipes/nespresso-recipes-Ethiopia-Yirgacheffe-Coffee-Press.jpg",
  },
  {
    name: "ሻይ (Tea)",
    price: 40.0,
    category: FoodCategory.HOTDRINK,
    imageUrl:
      "https://images.services.kitchenstories.io/fSp-I8NB8V-L17sS0HqtrTVg22g=/1080x0/filters:quality(85)/images.kitchenstories.io/wagtailOriginalImages/R2676-final-photo.jpg",
  },

  // --- Juices (Mapped to JUICE category) ---
  {
    name: "አቮካዶ ጁስ (Avocado Juice)",
    price: 90.0,
    category: FoodCategory.JUICE,
    imageUrl:
      "https://www.foxyfolksy.com/wp-content/uploads/2020/07/avocado-smoothie.jpg",
  },
  {
    name: "ማንጎ ጁስ (Mango Juice)",
    price: 85.0,
    category: FoodCategory.JUICE,
    imageUrl:
      "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/04/mango-juice.jpg",
  },
];

async function main() {
  console.log("Start seeding...");

  await prisma.foods.deleteMany();
  console.log("Deleted existing food records.");

  await prisma.foods.createMany({
    data: foodData,
  });

  console.log(`Seeding finished. ${foodData.length} food items created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
