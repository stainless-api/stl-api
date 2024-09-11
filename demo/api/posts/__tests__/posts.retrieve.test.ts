import { testClient } from "../../testClient";

describe("/api/posts/[postId]", function () {
  it("inclusion + selection", async function () {
    expect(
      await testClient.posts.retrieve("0284c330-a9ef-4a09-ae97-d0e0afdf0a1d", {
        include: ["comments.user"],
        select: "user_fields{id,name}",
      }),
    ).toMatchInlineSnapshot(`
      {
        "body": "Fugit doloremque voluptatum harum neque facere ducimus enim. Atque molestiae veritatis natus repellat. Non reiciendis asperiores exercitationem incidunt iure sint doloribus. Dicta eaque sequi mollitia at error iste fugit quae. Sit cum vitae veritatis incidunt quasi explicabo neque.",
        "comments": [
          {
            "body": "Vitae earum consequatur deleniti magnam numquam occaecati nihil optio.",
            "createdAt": "2023-05-22T22:17:14.466Z",
            "id": "2367d101-8223-412e-8b9c-b29b589e9287",
            "postId": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "updatedAt": "2023-05-22T22:17:14.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-05-22T22:17:13.969Z",
              "email": "Buddy18@yahoo.com",
              "emailVerified": null,
              "followingIds": [
                "d8026e07-9bb1-4693-8c33-814ed79c5ab4",
                "5fb6a9a2-ef81-4d19-99c8-b772c56a4617",
                "f7043a71-8171-4fa0-9686-7a35c1bf3c4c",
                "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
                "ff829dbc-95ee-462a-a6ae-7ea05f8d2719",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "image": null,
              "name": "Claudia Tremblay",
              "profileImage": null,
              "updatedAt": "2023-05-22T22:17:14.325Z",
              "username": "Pearl",
            },
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Deleniti temporibus nesciunt repellat voluptas impedit itaque.",
            "createdAt": "2023-05-22T22:17:14.466Z",
            "id": "741d0c85-175d-4476-bca3-a8184625590a",
            "postId": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "updatedAt": "2023-05-22T22:17:14.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-05-22T22:17:13.969Z",
              "email": "Buddy18@yahoo.com",
              "emailVerified": null,
              "followingIds": [
                "d8026e07-9bb1-4693-8c33-814ed79c5ab4",
                "5fb6a9a2-ef81-4d19-99c8-b772c56a4617",
                "f7043a71-8171-4fa0-9686-7a35c1bf3c4c",
                "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
                "ff829dbc-95ee-462a-a6ae-7ea05f8d2719",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "image": null,
              "name": "Claudia Tremblay",
              "profileImage": null,
              "updatedAt": "2023-05-22T22:17:14.325Z",
              "username": "Pearl",
            },
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Consequatur ducimus illo molestias cum aliquam odit impedit.",
            "createdAt": "2023-05-22T22:17:14.466Z",
            "id": "35ca03ce-8933-49d5-9a7f-06cf63546ead",
            "postId": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "updatedAt": "2023-05-22T22:17:14.466Z",
            "user": {
              "bio": null,
              "coverImage": null,
              "createdAt": "2023-05-22T22:17:13.969Z",
              "email": "Austen95@hotmail.com",
              "emailVerified": null,
              "followingIds": [
                "2f865fad-6edd-4bac-9513-5dc381baf873",
                "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
                "a23ef7c9-789f-46fb-a1b5-5dd072d157c4",
                "d8026e07-9bb1-4693-8c33-814ed79c5ab4",
                "f7043a71-8171-4fa0-9686-7a35c1bf3c4c",
              ],
              "hasNotification": null,
              "hashedPassword": null,
              "id": "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
              "image": null,
              "name": "Jeanette Jacobson",
              "profileImage": null,
              "updatedAt": "2023-05-22T22:17:14.856Z",
              "username": "Russell",
            },
            "userId": "ed917b5c-e22e-4d80-ae92-2a578ee2a1e4",
          },
        ],
        "createdAt": "2023-05-22T22:17:14.338Z",
        "id": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
        "image": null,
        "likedIds": [],
        "updatedAt": "2023-05-22T22:17:14.338Z",
        "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
        "user_fields": {
          "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          "name": "Claudia Tremblay",
        },
      }
    `);
  });
});
