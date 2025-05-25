import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getAuthUser } from "../lib/api";

function useAuthUser() {
  //tanstack query
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // Disable retry on failure
  });

  return {
    authUser: authUser.data?.user,
    isLoading: authUser.isLoading,
    isError: authUser.isError,
    error: authUser.error,
  };
}

export default useAuthUser;
