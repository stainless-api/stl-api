import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import useLoginModal from "../hooks/useLoginModal";
import useRegisterModal from "../hooks/useRegisterModal";
import useCurrentUser from "../hooks/useCurrentUser";

import Avatar from "./Avatar";
import Button from "./Button";
import { useClient } from "../api/client";
import { useQueryClient } from "@tanstack/react-query";

interface FormProps {
  placeholder: string;
  isComment?: boolean;
  postId?: string;
}

const Form: React.FC<FormProps> = ({ placeholder, isComment, postId }) => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const client = useClient();
  const queryClient = useQueryClient();

  const { data: currentUser } = useCurrentUser();

  const [body, setBody] = useState("");

  const onSuccess = useCallback(() => {
    toast.success("Tweet created");
    setBody("");
    queryClient.invalidateQueries({
      queryKey: client.posts.list.getQueryKey(),
    });
    if (postId != null) {
      queryClient.invalidateQueries({
        queryKey: client.posts.retrieve.getQueryKey(postId),
      });
    }
  }, [postId]);

  const onError = useCallback(() => {
    toast.error("Something went wrong");
  }, []);

  const createComment = client.comments.useCreate({ onSuccess, onError });
  const createPost = client.posts.useCreate({ onSuccess, onError });
  const isLoading = createComment.isLoading || createPost.isLoading;

  const onSubmit = useCallback(() => {
    if (isComment) {
      if (!postId) {
        toast.error("You must have a post selected to add a comment.");
        return;
      }
      createComment.mutate({ body }, { query: { postId } });
    } else {
      createPost.mutate({ body });
    }
  }, [body, isComment, postId, createComment, createPost]);

  return (
    <div className="border-b-[1px] border-neutral-800 px-5 py-2">
      {currentUser ? (
        <div className="flex flex-row gap-4">
          <div>
            <Avatar userId={currentUser?.id} />
          </div>
          <div className="w-full">
            <textarea
              disabled={isLoading}
              onChange={(event) => setBody(event.target.value)}
              value={body}
              className="
                disabled:opacity-80
                peer
                resize-none
                mt-3
                w-full
                bg-black
                ring-0
                outline-none
                text-[20px]
                placeholder-neutral-500
                text-white
              "
              placeholder={placeholder}
            ></textarea>
            <hr
              className="
                opacity-0
                peer-focus:opacity-100
                h-[1px]
                w-full
                border-neutral-800
                transition"
            />
            <div className="mt-4 flex flex-row justify-end">
              <Button
                disabled={isLoading || !body}
                onClick={onSubmit}
                label="Tweet"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8">
          <h1 className="text-white text-2xl text-center mb-4 font-bold">
            Welcome to Twitter
          </h1>
          <div className="flex flex-row items-center justify-center gap-4">
            <Button label="Login" onClick={loginModal.onOpen} />
            <Button label="Register" onClick={registerModal.onOpen} secondary />
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
