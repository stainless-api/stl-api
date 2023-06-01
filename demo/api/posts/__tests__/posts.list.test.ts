import { testClient } from "../../testClient";

describe("/api/posts", function () {
  it(`pagination`, async function () {
    expect((await testClient.posts.list({ pageSize: 3 })).data)
      .toMatchInlineSnapshot(`
        {
          "endCursor": "IjAwNTA5ZmY0LTA3ZTgtNGRhYS05NzdmLTk1ZDNhNDZjODIzYSI=",
          "hasNextPage": true,
          "items": [
            {
              "body": "Doloremque itaque earum. Totam in ducimus impedit voluptatem nam. Tempora consequatur praesentium pariatur occaecati quaerat eaque.",
              "createdAt": "2023-06-01T13:30:27.466Z",
              "id": "0039c042-e97c-4c8b-89e7-f65bed2b586f",
              "image": null,
              "likedIds": [],
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "userId": "900a0716-682a-42ae-b5dc-96fc1e9273ac",
            },
            {
              "body": "Autem fugiat est vitae totam quo sunt. Blanditiis labore ea nobis. Possimus nulla omnis perspiciatis iste.",
              "createdAt": "2023-06-01T13:30:27.466Z",
              "id": "0042cebe-7bc7-4a29-ad10-89d573a39abe",
              "image": null,
              "likedIds": [],
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "userId": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
            },
            {
              "body": "Quod odit harum. Ab explicabo facere odio blanditiis incidunt at voluptas ullam. Recusandae eos vel quae officiis.",
              "createdAt": "2023-06-01T13:30:27.466Z",
              "id": "00509ff4-07e8-4daa-977f-95d3a46c823a",
              "image": null,
              "likedIds": [],
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "userId": "b3911fc7-4784-47b6-99af-7fe4ff3c99f7",
            },
          ],
          "startCursor": "IjAwMzljMDQyLWU5N2MtNGM4Yi04OWU3LWY2NWJlZDJiNTg2ZiI=",
        }
      `);
    expect(
      (
        await testClient.posts.list({
          pageSize: 3,
          pageAfter: "IjAwNTA5ZmY0LTA3ZTgtNGRhYS05NzdmLTk1ZDNhNDZjODIzYSI=",
        })
      ).data
    ).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAwYmZlZDUwLTM5NjYtNGJlYy1iMWJmLWNkNzFhYTZhZDhkZSI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Accusamus mollitia laboriosam recusandae. Iste molestias rerum sint labore.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00589963-352d-4887-a5f7-816a8a718d55",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "userId": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
          },
          {
            "body": "Recusandae omnis atque corrupti minima quia. Eligendi quae magnam explicabo accusamus eaque alias blanditiis accusantium et. Et laborum labore eligendi vero dolorum totam sint. Alias distinctio quisquam. Voluptas dolore labore non voluptate. Asperiores eius eligendi.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00939311-86e2-4f33-b593-6337e0b717e9",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "userId": "056c5d4d-c5e5-4fec-83ac-0b7ff12f15fa",
          },
          {
            "body": "Id exercitationem exercitationem ut non quo dolores. Rerum officia eum omnis possimus commodi.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00bfed50-3966-4bec-b1bf-cd71aa6ad8de",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "userId": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
          },
        ],
        "startCursor": "IjAwNTg5OTYzLTM1MmQtNDg4Ny1hNWY3LTgxNmE4YTcxOGQ1NSI=",
      }
    `);
    expect(
      (
        await testClient.posts.list({
          pageSize: 3,
          pageBefore: "IjAwNTg5OTYzLTM1MmQtNDg4Ny1hNWY3LTgxNmE4YTcxOGQ1NSI=",
        })
      ).data
    ).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAwZDIyMTM0LTNiMjMtNGRiZS1iN2UzLTAwY2I2NmM5YTA1NyI=",
        "hasPreviousPage": true,
        "items": [
          {
            "body": "Recusandae omnis atque corrupti minima quia. Eligendi quae magnam explicabo accusamus eaque alias blanditiis accusantium et. Et laborum labore eligendi vero dolorum totam sint. Alias distinctio quisquam. Voluptas dolore labore non voluptate. Asperiores eius eligendi.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00939311-86e2-4f33-b593-6337e0b717e9",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "userId": "056c5d4d-c5e5-4fec-83ac-0b7ff12f15fa",
          },
          {
            "body": "Id exercitationem exercitationem ut non quo dolores. Rerum officia eum omnis possimus commodi.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00bfed50-3966-4bec-b1bf-cd71aa6ad8de",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "userId": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
          },
          {
            "body": "Adipisci beatae occaecati deleniti incidunt nobis magni impedit tempora aliquam. Quis debitis harum aliquid similique dicta numquam.",
            "createdAt": "2023-05-22T22:17:14.867Z",
            "id": "00d22134-3b23-4dbe-b7e3-00cb66c9a057",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.867Z",
            "userId": "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
          },
        ],
        "startCursor": "IjAwOTM5MzExLTg2ZTItNGYzMy1iNTkzLTYzMzdlMGI3MTdlOSI=",
      }
    `);
  });
  it("expansion + selection", async function () {
    expect(
      (
        await testClient.posts.list({
          pageSize: 3,
          expand: ["items.user"],
          select: "items.user_fields{id,name}",
        })
      ).data
    ).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAwNTA5ZmY0LTA3ZTgtNGRhYS05NzdmLTk1ZDNhNDZjODIzYSI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Doloremque itaque earum. Totam in ducimus impedit voluptatem nam. Tempora consequatur praesentium pariatur occaecati quaerat eaque.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "0039c042-e97c-4c8b-89e7-f65bed2b586f",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-06-01T13:30:27.466Z",
              "email": "Layla62@yahoo.com",
              "emailVerified": null,
              "followingIds": [
                "a598bbaa-ec9f-4d5a-974d-ee369255cb46",
                "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
                "a67698cd-147d-4c85-bace-09e8de60d746",
                "482b125a-8c63-488b-a46c-f8cab9516d18",
                "900a0716-682a-42ae-b5dc-96fc1e9273ac",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "900a0716-682a-42ae-b5dc-96fc1e9273ac",
              "image": null,
              "name": "Shawna Herman",
              "profileImage": null,
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "username": "Opal",
            },
            "userId": "900a0716-682a-42ae-b5dc-96fc1e9273ac",
            "user_fields": {
              "id": "900a0716-682a-42ae-b5dc-96fc1e9273ac",
              "name": "Shawna Herman",
            },
          },
          {
            "body": "Autem fugiat est vitae totam quo sunt. Blanditiis labore ea nobis. Possimus nulla omnis perspiciatis iste.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "0042cebe-7bc7-4a29-ad10-89d573a39abe",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-06-01T13:30:27.466Z",
              "email": "Carmelo.Collins@gmail.com",
              "emailVerified": null,
              "followingIds": [
                "900a0716-682a-42ae-b5dc-96fc1e9273ac",
                "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
                "0ddb0bfa-79e9-4f63-a123-26adb9a8e89b",
                "85ceaf4f-271c-47d3-a0d2-91c6f24a9dfc",
                "b3911fc7-4784-47b6-99af-7fe4ff3c99f7",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
              "image": null,
              "name": "Ms. Judy Pacocha",
              "profileImage": null,
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "username": "Marques",
            },
            "userId": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
            "user_fields": {
              "id": "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
              "name": "Ms. Judy Pacocha",
            },
          },
          {
            "body": "Quod odit harum. Ab explicabo facere odio blanditiis incidunt at voluptas ullam. Recusandae eos vel quae officiis.",
            "createdAt": "2023-06-01T13:30:27.466Z",
            "id": "00509ff4-07e8-4daa-977f-95d3a46c823a",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-06-01T13:30:27.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-06-01T13:30:27.466Z",
              "email": "Keaton_Nicolas55@hotmail.com",
              "emailVerified": null,
              "followingIds": [
                "482b125a-8c63-488b-a46c-f8cab9516d18",
                "b00d5b25-ef07-4c47-a900-d3b20e22a7e7",
                "0ddb0bfa-79e9-4f63-a123-26adb9a8e89b",
                "a67698cd-147d-4c85-bace-09e8de60d746",
                "a598bbaa-ec9f-4d5a-974d-ee369255cb46",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "b3911fc7-4784-47b6-99af-7fe4ff3c99f7",
              "image": null,
              "name": "Bennie Runte",
              "profileImage": null,
              "updatedAt": "2023-06-01T13:30:27.466Z",
              "username": "Newton",
            },
            "userId": "b3911fc7-4784-47b6-99af-7fe4ff3c99f7",
            "user_fields": {
              "id": "b3911fc7-4784-47b6-99af-7fe4ff3c99f7",
              "name": "Bennie Runte",
            },
          },
        ],
        "startCursor": "IjAwMzljMDQyLWU5N2MtNGM4Yi04OWU3LWY2NWJlZDJiNTg2ZiI=",
      }
    `);
  });
});
