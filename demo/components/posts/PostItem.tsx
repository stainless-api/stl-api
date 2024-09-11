import { useRouter } from "next/router";
import { CSSProperties, useCallback, useMemo, forwardRef } from "react";
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage } from "react-icons/ai";
import { formatDistanceToNowStrict } from "date-fns";

import useLoginModal from "../../hooks/useLoginModal";
import useCurrentUser from "../../hooks/useCurrentUser";
import useLike from "../../hooks/useLike";

import Avatar from "../Avatar";
interface PostItemProps {
  item: Record<string, any>;
  userId?: string;
  style?: CSSProperties;
}

const PostItem = forwardRef<HTMLDivElement, PostItemProps>(function PostItem(
  { item = {}, userId, style },
  ref,
) {
  const router = useRouter();
  const loginModal = useLoginModal();

  const { data: currentUser } = useCurrentUser();
  const { hasLiked, toggleLike } = useLike({ postId: item.id, userId });

  const goToUser = useCallback(
    (ev: any) => {
      ev.stopPropagation();
      router.push(`/users/${item.user.id}`);
    },
    [router, item.user.id],
  );

  const goToPost = useCallback(() => {
    router.push(`/posts/${item.id}`);
  }, [router, item.id]);

  const onLike = useCallback(
    async (ev: any) => {
      ev.stopPropagation();

      if (!currentUser) {
        return loginModal.onOpen();
      }

      toggleLike();
    },
    [loginModal, currentUser, toggleLike],
  );

  const LikeIcon = hasLiked ? AiFillHeart : AiOutlineHeart;

  const createdAt = useMemo(() => {
    if (!item?.createdAt) {
      return null;
    }

    return formatDistanceToNowStrict(new Date(item.createdAt));
  }, [item.createdAt]);

  return (
    <div
      ref={ref}
      style={style}
      onClick={goToPost}
      className="
        border-b-[1px] 
        border-neutral-800 
        p-5 
        cursor-pointer 
        hover:bg-neutral-900 
        transition
      "
    >
      <div className="flex flex-row items-start gap-3">
        <Avatar userId={item.user.id} />
        <div>
          <div className="flex flex-row items-center gap-2">
            <p
              onClick={goToUser}
              className="
                text-white 
                font-semibold 
                cursor-pointer 
                hover:underline
            "
            >
              {item.user.name}
            </p>
            <span
              onClick={goToUser}
              className="
                text-neutral-500
                cursor-pointer
                hover:underline
                hidden
                md:block
            "
            >
              @{item.user.username}
            </span>
            <span className="text-neutral-500 text-sm">{createdAt}</span>
          </div>
          <div className="text-white mt-1">{item.body}</div>
          <div className="flex flex-row items-center mt-3 gap-10">
            <div
              className="
                flex 
                flex-row 
                items-center 
                text-neutral-500 
                gap-2 
                cursor-pointer 
                transition 
                hover:text-sky-500
            "
            >
              <AiOutlineMessage size={20} />
              <p>{item.comments?.length || 0}</p>
            </div>
            <div
              onClick={onLike}
              className="
                flex 
                flex-row 
                items-center 
                text-neutral-500 
                gap-2 
                cursor-pointer 
                transition 
                hover:text-red-500
            "
            >
              <LikeIcon color={hasLiked ? "red" : ""} size={20} />
              <p>{item.likedIds.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PostItem;
