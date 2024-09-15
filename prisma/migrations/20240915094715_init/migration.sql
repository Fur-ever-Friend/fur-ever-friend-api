-- CreateEnum
CREATE TYPE "Role" AS ENUM ('UNREGISTER', 'CUSTOMER', 'PETSITTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petsitter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "account_status" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,

    CONSTRAINT "Petsitter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "start_datetime" TIMESTAMP(3) NOT NULL,
    "end_datetime" TIMESTAMP(3) NOT NULL,
    "pick_up_point" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "customer_id" TEXT NOT NULL,
    "petsitter_id" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity_Progress" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "petsitter_id" TEXT NOT NULL,

    CONSTRAINT "Activity_Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity_Payment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "petsitter_id" TEXT NOT NULL,

    CONSTRAINT "Activity_Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity_Checkbox" (
    "id" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "pet_service_id" TEXT NOT NULL,

    CONSTRAINT "Activity_Checkbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "state" "State" NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "payment_mothod" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "State" "State" NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "size" "Size" NOT NULL,
    "image_url" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "animal_type_id" TEXT NOT NULL,
    "breed_id" TEXT NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Animal_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Breed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petsitter_Request" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "state" "State" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "activity_id" TEXT NOT NULL,
    "petsitter_id" TEXT NOT NULL,

    CONSTRAINT "Petsitter_Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet_Service" (
    "id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,

    CONSTRAINT "Pet_Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service_Type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Service_Type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Petsitter_userId_key" ON "Petsitter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_email_key" ON "Qualification"("email");

-- AddForeignKey
ALTER TABLE "Petsitter" ADD CONSTRAINT "Petsitter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_petsitter_id_fkey" FOREIGN KEY ("petsitter_id") REFERENCES "Petsitter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Progress" ADD CONSTRAINT "Activity_Progress_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Progress" ADD CONSTRAINT "Activity_Progress_petsitter_id_fkey" FOREIGN KEY ("petsitter_id") REFERENCES "Petsitter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Payment" ADD CONSTRAINT "Activity_Payment_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Payment" ADD CONSTRAINT "Activity_Payment_petsitter_id_fkey" FOREIGN KEY ("petsitter_id") REFERENCES "Petsitter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity_Checkbox" ADD CONSTRAINT "Activity_Checkbox_pet_service_id_fkey" FOREIGN KEY ("pet_service_id") REFERENCES "Pet_Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_animal_type_id_fkey" FOREIGN KEY ("animal_type_id") REFERENCES "Animal_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "Breed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petsitter_Request" ADD CONSTRAINT "Petsitter_Request_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petsitter_Request" ADD CONSTRAINT "Petsitter_Request_petsitter_id_fkey" FOREIGN KEY ("petsitter_id") REFERENCES "Petsitter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet_Service" ADD CONSTRAINT "Pet_Service_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
