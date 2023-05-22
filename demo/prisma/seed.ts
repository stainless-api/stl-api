import { PrismaClient } from ".prisma/client";
import { faker } from "@faker-js/faker";
import { range, sample, sampleSize } from "lodash";

const prisma = new PrismaClient();
async function main() {
  await prisma.user.createMany({
    data: range(10).map(() => ({
      name: faker.name.fullName(),
      username: faker.name.firstName(),
      email: faker.internet.email(),
    })),
  });
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        followingIds: sampleSize(users, 5).map((u) => u.id),
      },
    });
    await prisma.post.createMany({
      data: range(200).map(() => ({
        userId: user.id,
        body: faker.lorem.sentences(),
      })),
    });
    const posts = await prisma.post.findMany({
      where: { userId: user.id },
    });
    for (const post of sampleSize(posts, Math.floor(posts.length / 4))) {
      await prisma.comment.createMany({
        data: range(5).map(() => ({
          postId: post.id,
          userId: sample(users)!.id,
          body: faker.lorem.sentence(),
        })),
      });
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
