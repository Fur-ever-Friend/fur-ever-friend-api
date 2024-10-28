import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dogType = await prisma.animalType.create({
        data: { name: 'Dog' },
    });

    const catType = await prisma.animalType.create({
        data: { name: 'Cat' },
    });

    await prisma.breed.createMany({
        data: [
            { name: 'Golden Retriever', animalTypeId: dogType.id },
            { name: 'Bulldog', animalTypeId: dogType.id },
            { name: 'Beagle', animalTypeId: dogType.id },
            { name: 'Poodle', animalTypeId: dogType.id },
            { name: 'German Shepherd', animalTypeId: dogType.id },
            { name: 'Labrador Retriever', animalTypeId: dogType.id },
            { name: 'Dachshund', animalTypeId: dogType.id },
            { name: 'Rottweiler', animalTypeId: dogType.id },
        ],
        skipDuplicates: true,
    });

    await prisma.breed.createMany({
        data: [
            { name: 'Siamese', animalTypeId: catType.id },
            { name: 'Persian', animalTypeId: catType.id },
            { name: 'Maine Coon', animalTypeId: catType.id },
            { name: 'Bengal', animalTypeId: catType.id },
            { name: 'Sphynx', animalTypeId: catType.id },
            { name: 'British Shorthair', animalTypeId: catType.id },
            { name: 'Russian Blue', animalTypeId: catType.id },
            { name: 'Scottish Fold', animalTypeId: catType.id },
        ],
        skipDuplicates: true,
    });

    // await prisma.user.createMany({
    //     data: [{
    //         email: "admin2@admin.com",
    //         password: "admin1234",
    //         role: "ADMIN",
    //     },
    //     {
    //         email: "customer2@customer.com",
    //         password: "admin1234",
    //         role: "CUSTOMER",
    //         firstname: "John",
    //         lastname: "Mcginn",
    //         avatar: "bd4239a-6363-4ea5-a6c6-d9bc97857a5b-antonyV2.jpg",
    //         phone: "0123456789",
    //     },
    //     {
    //         email: "customer2@mail.com",
    //         password: "admin1234",
    //         role: "CUSTOMER",
    //         firstname: "Mark",
    //         lastname: "Nobel",
    //         avatar: "bd4239a-6363-4ea5-a6c6-d9bc97857a5b-antonyV2.jpg",
    //         phone: "0123456789",
    //     },
    //     ]
    // })

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
