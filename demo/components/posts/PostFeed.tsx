import * as React from "react";
import PostItem from "./PostItem";
import { client } from "~/api/client";
import { useInfiniteQuery } from "~/libs/useInfiniteQuery";

interface PostFeedProps {
  userId?: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ userId }) => {
  const { hasNextPage, isFetchingNextPage, fetchNextPage, items } =
    useInfiniteQuery(client.posts, {
      userId,
      pageSize: 5,
      include: ["items.user", "items.comments"],
    });

  return (
    <>
      {items.map((post) => (
        <PostItem key={post.id} userId={userId} item={post} />
      ))}
      {hasNextPage ? (
        <LoadMoreButton
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        />
      ) : undefined}
    </>
  );
};

export default PostFeed;

interface LoadMoreButtonProps {
  loading?: boolean;
  onClick?: (e: React.SyntheticEvent<any>) => any;
}

function LoadMoreButton({
  loading,
  onClick,
}: LoadMoreButtonProps): React.ReactElement {
  return (
    <button
      className="
        text-white
        border-b-[1px]
        border-neutral-800
        p-5
        cursor-pointer
        hover:bg-neutral-900
        transition
        w-full
      "
      disabled={loading}
      onClick={onClick}
    >
      {loading ? "Loading..." : "Load more..."}
    </button>
  );
}
