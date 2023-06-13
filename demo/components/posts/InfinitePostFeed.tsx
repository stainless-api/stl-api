import * as React from "react";
import PostItem from "./PostItem";
import { client } from "../../api/client";
import InfiniteScroll, { LoadingProps, ErrorProps } from "../InfiniteScroll";

interface PostFeedProps {
  userId?: string;
}

const InfinitePostFeed: React.FC<PostFeedProps> = ({ userId }) => {
  const { itemAndPlaceholderCount, useItem } = client.posts.useInfiniteList({
    userId,
    expand: ["items.user", "items.comments"],
  });

  return (
    <div className="flex-auto">
      <InfiniteScroll
        itemCount={itemAndPlaceholderCount}
        useItem={useItem}
        minItemSize={100}
        Item={PostItem}
        Loading={LoadingItem}
        Error={ErrorItem}
      />
    </div>
  );
};

export default InfinitePostFeed;

type StatusItemProps = LoadingProps<any> & {
  children?: React.ReactNode;
};

const StatusItem = React.forwardRef<HTMLDivElement, StatusItemProps>(
  function StatusItem({ style, children }: StatusItemProps, ref) {
    return (
      <div
        ref={ref}
        style={style}
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
      >
        {children}
      </div>
    );
  }
);

const LoadingItem = React.forwardRef<HTMLDivElement, LoadingProps<any>>(
  function LoadingItem(props: StatusItemProps, ref) {
    return (
      <StatusItem {...props} ref={ref}>
        Loading...
      </StatusItem>
    );
  }
);

const ErrorItem = React.forwardRef<HTMLDivElement, ErrorProps<any>>(
  function ErrorItem({ error, ...props }, ref) {
    return (
      <StatusItem {...props} ref={ref}>
        Error: {error.message}
      </StatusItem>
    );
  }
);
