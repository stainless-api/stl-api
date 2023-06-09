import { testClient } from "../../testClient";
import { omit } from "lodash";

describe("/api/posts", function () {
  it(`pagination`, async function () {
    const firstPage = await testClient.posts.list({
      userId: "187f77f6-5570-40ae-84f7-bcd28fab78a2",
      sortBy: "id",
      pageSize: 3,
    });
    expect(firstPage.data).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAzNGNlOTA1LWZkMGQtNDA5Yi1hMDZhLTAyNDAyNDAxYjg0YiI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Nemo beatae natus. Nostrum cumque quod modi deleniti voluptatum. Provident quasi esse autem amet. Saepe maiores eveniet possimus exercitationem iusto optio cupiditate quasi. Eligendi ab perferendis earum hic.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "003031b5-6157-4b35-9d11-3e8b9b8745f3",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Fugit doloremque voluptatum harum neque facere ducimus enim. Atque molestiae veritatis natus repellat. Non reiciendis asperiores exercitationem incidunt iure sint doloribus. Dicta eaque sequi mollitia at error iste fugit quae. Sit cum vitae veritatis incidunt quasi explicabo neque.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Explicabo doloribus ipsam reiciendis laboriosam magni veniam voluptate. Molestias molestiae a iusto occaecati repellat.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "034ce905-fd0d-409b-a06a-02402401b84b",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
        ],
        "startCursor": "IjAwMzAzMWI1LTYxNTctNGIzNS05ZDExLTNlOGI5Yjg3NDVmMyI=",
      }
    `);
    const secondPage = await firstPage.getNextPage();
    expect(secondPage.data).toMatchInlineSnapshot(`
      {
        "endCursor": "IjA5NTBmZDk2LTQyOGUtNDEwMy05NzFjLTllOWZkMzhhYjAxZiI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Deserunt temporibus et alias sapiente dolorem quidem saepe. Autem quia odit eaque architecto porro.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "060d546e-f7a9-4ab1-8124-016b7345e8b4",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Ipsam voluptatibus fugiat ex fugit fugit vitae. Possimus natus culpa tempora sit. Ipsum minima incidunt nulla vitae corporis laboriosam quia commodi vel.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "0662d97e-dae6-4160-884c-28ca140ef209",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
          {
            "body": "Aperiam harum dolores. Eligendi fuga incidunt illo sed perspiciatis nisi. Eum a soluta sapiente asperiores molestias magnam libero nihil.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "0950fd96-428e-4103-971c-9e9fd38ab01f",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
            "userId": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          },
        ],
        "startCursor": "IjA2MGQ1NDZlLWY3YTktNGFiMS04MTI0LTAxNmI3MzQ1ZThiNCI=",
      }
    `);
    expect((await secondPage.getPreviousPage()).data).toEqual({
      ...omit(firstPage.data, "hasNextPage"),
      hasPreviousPage: false,
    });
  });
  it("inclusion + selection", async function () {
    expect(
      (
        await testClient.posts.list({
          userId: "187f77f6-5570-40ae-84f7-bcd28fab78a2",
          pageSize: 3,
          include: ["items.user"],
          select: "items.user_fields{id,name}",
        })
      ).data
    ).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAzNGNlOTA1LWZkMGQtNDA5Yi1hMDZhLTAyNDAyNDAxYjg0YiI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Nemo beatae natus. Nostrum cumque quod modi deleniti voluptatum. Provident quasi esse autem amet. Saepe maiores eveniet possimus exercitationem iusto optio cupiditate quasi. Eligendi ab perferendis earum hic.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "003031b5-6157-4b35-9d11-3e8b9b8745f3",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
          {
            "body": "Fugit doloremque voluptatum harum neque facere ducimus enim. Atque molestiae veritatis natus repellat. Non reiciendis asperiores exercitationem incidunt iure sint doloribus. Dicta eaque sequi mollitia at error iste fugit quae. Sit cum vitae veritatis incidunt quasi explicabo neque.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
          {
            "body": "Explicabo doloribus ipsam reiciendis laboriosam magni veniam voluptate. Molestias molestiae a iusto occaecati repellat.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "034ce905-fd0d-409b-a06a-02402401b84b",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
        ],
        "startCursor": "IjAwMzAzMWI1LTYxNTctNGIzNS05ZDExLTNlOGI5Yjg3NDVmMyI=",
      }
    `);
  });
  it("expansion + selection 2", async function () {
    const { data } = await testClient.posts.list({
      userId: "187f77f6-5570-40ae-84f7-bcd28fab78a2",
      pageSize: 3,
      include: ["items.user"],
      select: "items.user_fields{id,name,comments_fields{id}}",
    });
    expect({
      ...data,
      items: data.items.map(
        ({
          user_fields: {
            // @ts-expect-error seems to be a TS bug...
            comments_fields,
            ...user_fields_rest
          },
          ...rest
        }) => ({
          ...rest,
          user_fields: {
            ...user_fields_rest,
            ...(comments_fields
              ? { comments_fields: comments_fields.slice(0, 5) }
              : null),
          },
        })
      ),
    }).toMatchInlineSnapshot(`
      {
        "endCursor": "IjAzNGNlOTA1LWZkMGQtNDA5Yi1hMDZhLTAyNDAyNDAxYjg0YiI=",
        "hasNextPage": true,
        "items": [
          {
            "body": "Nemo beatae natus. Nostrum cumque quod modi deleniti voluptatum. Provident quasi esse autem amet. Saepe maiores eveniet possimus exercitationem iusto optio cupiditate quasi. Eligendi ab perferendis earum hic.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "003031b5-6157-4b35-9d11-3e8b9b8745f3",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "comments_fields": [
                {
                  "id": "679e5478-c025-4a38-a701-a00d9fdcd847",
                },
                {
                  "id": "2c0b1f16-44cc-4ea5-bf95-7fb854c600eb",
                },
                {
                  "id": "5f67c2dd-9dea-47d5-afd5-8a8dc5567872",
                },
                {
                  "id": "39baaa50-bb3c-4f12-9ba2-07da7b5b8cb1",
                },
                {
                  "id": "edab2a6a-0987-4969-ad05-a79b3d1e36f0",
                },
              ],
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
          {
            "body": "Fugit doloremque voluptatum harum neque facere ducimus enim. Atque molestiae veritatis natus repellat. Non reiciendis asperiores exercitationem incidunt iure sint doloribus. Dicta eaque sequi mollitia at error iste fugit quae. Sit cum vitae veritatis incidunt quasi explicabo neque.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "0284c330-a9ef-4a09-ae97-d0e0afdf0a1d",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "comments_fields": [
                {
                  "id": "679e5478-c025-4a38-a701-a00d9fdcd847",
                },
                {
                  "id": "2c0b1f16-44cc-4ea5-bf95-7fb854c600eb",
                },
                {
                  "id": "5f67c2dd-9dea-47d5-afd5-8a8dc5567872",
                },
                {
                  "id": "39baaa50-bb3c-4f12-9ba2-07da7b5b8cb1",
                },
                {
                  "id": "edab2a6a-0987-4969-ad05-a79b3d1e36f0",
                },
              ],
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
          {
            "body": "Explicabo doloribus ipsam reiciendis laboriosam magni veniam voluptate. Molestias molestiae a iusto occaecati repellat.",
            "createdAt": "2023-05-22T22:17:14.338Z",
            "id": "034ce905-fd0d-409b-a06a-02402401b84b",
            "image": null,
            "likedIds": [],
            "updatedAt": "2023-05-22T22:17:14.338Z",
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
            "user_fields": {
              "comments_fields": [
                {
                  "id": "679e5478-c025-4a38-a701-a00d9fdcd847",
                },
                {
                  "id": "2c0b1f16-44cc-4ea5-bf95-7fb854c600eb",
                },
                {
                  "id": "5f67c2dd-9dea-47d5-afd5-8a8dc5567872",
                },
                {
                  "id": "39baaa50-bb3c-4f12-9ba2-07da7b5b8cb1",
                },
                {
                  "id": "edab2a6a-0987-4969-ad05-a79b3d1e36f0",
                },
              ],
              "id": "187f77f6-5570-40ae-84f7-bcd28fab78a2",
              "name": "Claudia Tremblay",
            },
          },
        ],
        "startCursor": "IjAwMzAzMWI1LTYxNTctNGIzNS05ZDExLTNlOGI5Yjg3NDVmMyI=",
      }
    `);
  });
});
describe("authenticated create /api/posts", function () {
  it("no authentication", async function () {
    await expect(
      testClient.posts.create({
        body: "nefarious post",
      })
    ).rejects.toThrow();
  });
});
