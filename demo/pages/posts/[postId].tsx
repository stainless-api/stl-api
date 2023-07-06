import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";

import Header from "../../components/Header";
import Form from "../../components/Form";
import PostItem from "../../components/posts/PostItem";
import CommentFeed from "../../components/posts/CommentFeed";
import { client } from "../../api/client";

const PostView = () => {
  const router = useRouter();
  const { postId } = router.query;

  const { data: fetchedPost, isLoading } = client.posts.useRetrieve(
    typeof postId === "string" ? postId : "",
    {
      include: ["user", "comments.user"],
    },
    {
      enabled: typeof postId === "string",
    }
  );

  if (isLoading || !fetchedPost) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader color="lightblue" size={80} />
      </div>
    );
  }

  const { comments } = fetchedPost;

  return (
    <>
      <Header showBackArrow label="Tweet" />
      <PostItem item={fetchedPost} />
      <Form
        postId={postId as string}
        isComment
        placeholder="Tweet your reply"
      />
      {comments && <CommentFeed comments={comments} />}
    </>
  );
};

export default PostView;
