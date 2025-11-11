
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  name      String?
  password_hash String
  role      Role    @default(USER)
  createdAt DateTime @default(now())

  orders    Orders[]
}

model Foods {
  id        String   @id @default(cuid())
  name      String
  price     Float
  category  FoodCategory  @default(NORMAL)
  imageUrl  String?
  createdAt DateTime @default(now())
  
  orders    Orders[]
}

model Orders {
  id        String   @id @default(cuid())
  userId    String
  foodId    String
  quantity  Int
  bonoNumber  Int
  orderStatus OrderStatus @default(PENDING)
  totalPrice Float
  paymentStatus PaymentStatus @default(NOTPAID)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  food      Foods    @relation(fields: [foodId], references: [id])
}

enum Role {
  USER
  ADMIN
  CASHIER
}

enum FoodCategory {
  NORMAL
  SPECIAL
  HOTDRINK
  JUICE
}

enum OrderStatus {
  PENDING
  ACCEPTED
  REJECTED
  FAILED
  COMPLETED
  DEILVERED
  RETURNED
}

enum PaymentStatus {
  PAID
  NOTPAID
}
