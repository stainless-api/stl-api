import Header from "../components/Header";
import Form from "../components/Form";
import InfinitePostFeed from "../components/posts/InfinitePostFeed";

export default function Home() {
  return (
    <>
      <Header label="Home" />
      <Form placeholder="What's happening?" />
      <InfinitePostFeed />
    </>
  );
}
