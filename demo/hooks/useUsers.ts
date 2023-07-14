import useSWR from "swr";
import { useClient } from "../api/client";

const useUsers = () => {
  const client = useClient();
  const { data, error, isLoading, mutate } = useSWR("users-list", () =>
    client.users.list({ pageSize: 3 })
  );

  return {
    data: data?.items,
    error,
    isLoading,
    mutate,
  };
};

export default useUsers;
