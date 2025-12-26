import prisma from "./lib/prisma";

async function main() {
    // Test Connection by counting users
    const userCount = await prisma.user.count();
    console.log(`Connected! Current user count: ${userCount}`);
}

main()
    .then(async() => {
        await prisma.$disconnect();
    })
    .catch(async(e) => {
        console.error('Connection failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
