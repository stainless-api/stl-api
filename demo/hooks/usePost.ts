import useSWR from "swr";
import fetcher from "../libs/fetcher";
import qs from "qs";

const usePost = (postId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    postId
      ? `/api/posts/${postId}?${qs.stringify({
          expand: ["user", "comments.user"],
        })}`
      : null,
    fetcher
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export default usePost;
